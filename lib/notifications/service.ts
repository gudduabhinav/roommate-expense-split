import { supabase } from '../supabase/client';

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        await this.requestPermission();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<string | null> {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BNCh7COt7yGGa9xG52w1FI6SdSqIBH2_Odu8byBkAlqJzl79JUo7y-HaE21fqjal7_dQtyCKEy_Ek5EpYII77t8'
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription: JSON.stringify(subscription),
            endpoint: subscription.endpoint,
          });
      }

      return subscription.endpoint;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return null;
    }
  }

  async sendGroupNotification(groupId: string, message: string, type: 'expense' | 'member' | 'settlement') {
    try {
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();

      if (members && group) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: members.map(m => m.user_id),
            title: `${group.name} Update`,
            body: message,
            data: { type, groupId, url: `/group/${groupId}` }
          })
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();