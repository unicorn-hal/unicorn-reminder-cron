import { MedicinesApi, MedicineReminder } from "./service/api/medicines/medicines_api";
import { NotificationApi } from "./service/api/notification/notification_api";

const main = async () => {
    try {
        const now: Date = new Date();
        // const now: Date = new Date('2024-12-02T12:00:01Z'); // Debug
        const medicinesApi = new MedicinesApi();
        const notificationApi = new NotificationApi();

        /**
         * おくすりリマインダーの該当者に通知を送信する
         */
        const medicinesApiRes = await medicinesApi.getMedicineReminders(now);
        if (medicinesApiRes.statusCode !== 200) {
            throw new Error('Failed to get medicine reminders');
        }
        const medicineReminders: MedicineReminder[] = medicinesApiRes.data['data'];
        const tokens = medicineReminders.map((reminder) => reminder.fcmTokenId).filter((token) => token !== 'debugToken');

        const multiSendRes = await notificationApi.multiSend({
            title: 'おくすりの時間です',
            body: 'アプリを開いて服用の記録をしましょう',
            tokens: tokens,
        });
        if (multiSendRes.statusCode !== 200) {
            throw new Error('Failed to send notifications');
        }
        console.log('Notification sent:', multiSendRes.data['responses']);
    } catch (error) {
        console.error(error);
    }
};

main();