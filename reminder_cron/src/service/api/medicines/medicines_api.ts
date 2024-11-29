import { ApiCore, Response } from "../core/api_core";

export interface MedicineRemindersRequest {
    reminderTime: string;
    reminderDayOfWeek: string;
}

export class MedicinesApi extends ApiCore {
    constructor() {
        super({ endpoint: '/medicines' });
    }

    async getMedicineReminders({ reminderTime, reminderDayOfWeek }: MedicineRemindersRequest): Promise<Response> {
        return await this.get('/reminders?reminderTime=' + reminderTime + '&reminderDayOfWeek=' + reminderDayOfWeek);
    }
}