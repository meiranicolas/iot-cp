// Notification Service for spending alerts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Receipt, SpendingByCategory } from '../types';
import { calculateSpendingByCategory } from './receiptService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Send a local notification
 */
export async function sendNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Analyze spending and send alerts if necessary
 */
export async function analyzeAndNotify(receipts: Receipt[]): Promise<void> {
  if (receipts.length === 0) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Calculate current month spending
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthReceipts = receipts.filter(
    (r) => r.date.toISOString().slice(0, 7) === currentMonth
  );

  const totalThisMonth = currentMonthReceipts.reduce(
    (sum, r) => sum + r.totalAmount,
    0
  );

  // Alert if spending exceeds R$ 1000 this month
  if (totalThisMonth > 1000) {
    await sendNotification(
      '⚠️ Alerta de Gastos',
      `Você já gastou R$ ${totalThisMonth.toFixed(2)} este mês!`,
      { type: 'spending_alert' }
    );
  }

  // Check category spending
  const categorySpending = calculateSpendingByCategory(currentMonthReceipts);
  const highestCategory = categorySpending.reduce((prev, current) =>
    prev.total > current.total ? prev : current
  );

  if (highestCategory && highestCategory.total > 500) {
    await sendNotification(
      '📊 Categoria em Destaque',
      `Seus gastos em ${highestCategory.category} chegaram a R$ ${highestCategory.total.toFixed(2)} este mês`,
      { type: 'category_alert', category: highestCategory.category }
    );
  }

  // Compare with previous month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = lastMonth.toISOString().slice(0, 7);

  const lastMonthReceipts = receipts.filter(
    (r) => r.date.toISOString().slice(0, 7) === lastMonthKey
  );

  if (lastMonthReceipts.length > 0) {
    const totalLastMonth = lastMonthReceipts.reduce(
      (sum, r) => sum + r.totalAmount,
      0
    );

    const percentageChange =
      ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

    if (percentageChange > 20) {
      await sendNotification(
        '📈 Aumento de Gastos',
        `Seus gastos aumentaram ${percentageChange.toFixed(1)}% em relação ao mês passado`,
        { type: 'trend_alert', change: percentageChange }
      );
    }
  }
}

/**
 * Schedule daily spending summary notification
 */
export async function scheduleDailySummary(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  try {
    // Cancel existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification at 8 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Resumo Diário',
        body: 'Confira seus gastos de hoje no app!',
        data: { type: 'daily_summary' },
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });

    console.log('Daily summary notification scheduled');
  } catch (error) {
    console.error('Error scheduling daily summary:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}
