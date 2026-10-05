import { Notification } from './notification.model.js';

export class NotificationService {
  static async getUserNotifications(userId: string) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  static async markAsRead(userId: string, notificationId: string) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { readAt: new Date() },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId, $or: [{ readAt: { $exists: false } }, { readAt: null }] },
      { readAt: new Date() }
    );
    return { success: true };
  }
  
  // Internal method to create notifications from other modules
  static async notifyUser(userId: string, title: string, message: string, type: string = 'system') {
    return await Notification.create({ userId, title, message, type });
  }
}
