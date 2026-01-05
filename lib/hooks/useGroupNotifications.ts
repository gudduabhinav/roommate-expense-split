import { useEffect } from 'react';
import { notificationService } from '@/lib/notifications/service';

export function useGroupNotifications() {
  const sendExpenseNotification = async (groupId: string, expenseTitle: string, amount: number, paidBy: string) => {
    await notificationService.sendGroupNotification(
      groupId,
      `${paidBy} added "${expenseTitle}" for ₹${amount}`,
      'expense'
    );
  };

  const sendMemberNotification = async (groupId: string, memberName: string, action: 'joined' | 'left') => {
    await notificationService.sendGroupNotification(
      groupId,
      `${memberName} ${action} the group`,
      'member'
    );
  };

  const sendSettlementNotification = async (groupId: string, fromUser: string, toUser: string, amount: number) => {
    await notificationService.sendGroupNotification(
      groupId,
      `${fromUser} paid ${toUser} ₹${amount}`,
      'settlement'
    );
  };

  return {
    sendExpenseNotification,
    sendMemberNotification,
    sendSettlementNotification
  };
}