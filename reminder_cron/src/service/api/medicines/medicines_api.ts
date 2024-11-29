import { ApiCore, Response } from "../core/api_core";

type reminderDayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export interface MedicineRemindersRequest {
    reminderTime: string;
    reminderDayOfWeek: reminderDayOfWeek;
}

export class MedicinesApi extends ApiCore {
    constructor() {
        super({ endpoint: '/medicines' });
    }

    /**
     * 時刻と曜日に一致するおくすりリマインダーを取得する
     * @param date 
     * @returns 
     */
    async getMedicineReminders(date: Date): Promise<Response> {
        const request: MedicineRemindersRequest = this._makeReminderRequest(date);
        return await this.get('/reminders?reminderTime=' + request.reminderTime + '&reminderDayOfWeek=' + request.reminderDayOfWeek);
    }

    private _makeReminderRequest(date: Date): MedicineRemindersRequest {
        const reminderTime = date.getHours() + ':' + date.getMinutes();
        const reminderDayOfWeek = this._getDayOfWeek(date);
        return { reminderTime, reminderDayOfWeek };
    }

    private _getDayOfWeek(date: Date): reminderDayOfWeek {
        switch (date.getDay()) {
            case 0:
                return 'sunday';
            case 1:
                return 'monday';
            case 2:
                return 'tuesday';
            case 3:
                return 'wednesday';
            case 4:
                return 'thursday';
            case 5:
                return 'friday';
            case 6:
                return 'saturday';
            default:
                throw new Error('Invalid day of week');
        }
    }
}