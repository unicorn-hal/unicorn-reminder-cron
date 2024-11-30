import { MedicinesApi, MedicineReminder } from "./service/api/medicines/medicines_api";
import { NotificationApi } from "./service/api/notification/notification_api";

// const now: Date = new Date();
const now: Date = new Date('2024-12-02T12:00:01Z'); // Debug
const medicinesApi = new MedicinesApi();
const notificationApi = new NotificationApi();

const main = async () => {
    console.log(`Cron job started at ${now.toISOString()}`);

    // おくすりリマインダーの通知を送信
    await sendMedicineReminders();

    // 12:00に定期検診の通知を送信
    if (now.getHours() === 12 && now.getMinutes() === 0) {
        await sendRegularHealthCheckupNotification();
    }

    console.log('Cron job finished');
};

/**
 * おくすりリマインダーの該当者に通知を送信する
 */
const sendMedicineReminders = async () => {
    try {
        const medicinesApiRes = await medicinesApi.getMedicineReminders(now);
        if (medicinesApiRes.statusCode !== 200) {
            throw new Error('Failed to get medicine reminders');
        }
        const medicineReminders: MedicineReminder[] = medicinesApiRes.data['data'];
        const tokens = medicineReminders.map((reminder) => reminder.fcmTokenId).filter((token) => token !== 'debugToken');

        if (tokens.length === 0) {
            console.log('No reminders to send');
            return;
        }

        const multiSendRes = await notificationApi.multiSend({
            title: 'おくすりの時間です',
            body: 'アプリを開いて服用の記録をしましょう',
            tokens: tokens,
        });
        if (multiSendRes.statusCode !== 200) {
            throw new Error('Failed to send notifications');
        }
        console.log('Notification sent:', multiSendRes.data);
    } catch (error) {
        console.error(error);
    } finally {
        console.log('finished sending medicine reminders');
    }
};

/**
 * 定期検診の通知を送信する
 */
const sendRegularHealthCheckupNotification = async () => {
    try {
        const topicSendRes = await notificationApi.topicSend({
            title: '本日の検診はお済みですか？',
            body: 'Unicornアプリで毎日の健康状態を記録をしましょう！',
            topic: 'regularHealthCheckup',
        });
        if (topicSendRes.statusCode !== 200) {
            throw new Error('Failed to send notifications');
        }
        console.log('Notification sent:', topicSendRes.data);
    } catch (error) {
        console.error(error);
    } finally {
        console.log('finished sending regular health checkup notification');
    }
};

main();