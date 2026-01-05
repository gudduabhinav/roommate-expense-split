import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase/client';

// Only set VAPID details if all environment variables are present
if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userIds, title, body, data } = await request.json();

    // Check if VAPID is configured
    if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log('VAPID not configured, skipping push notifications');
      return NextResponse.json({ message: 'Push notifications not configured' }, { status: 200 });
    }

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', userIds);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' }, { status: 200 });
    }

    const notifications = subscriptions.map(async (sub) => {
      try {
        const subscription = JSON.parse(sub.subscription);
        await webpush.sendNotification(subscription, JSON.stringify({
          title,
          body,
          icon: '/icons/icon-512x512.png',
          badge: '/icons/icon-512x512.png',
          data
        }));
      } catch (error) {
        console.error('Failed to send to subscription:', error);
      }
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, sent: subscriptions.length });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}