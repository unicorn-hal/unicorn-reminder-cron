import { ApiCore, Response } from "../core/api_core";

export class NotificationApi extends ApiCore {
    constructor() {
        super({ baseUrl: 'notification-server', endpoint: '' });
    }

    async send(data: any): Promise<Response> {
        return await this.post(data, '/send');
    }

    async multiSend(data: any): Promise<Response> {
        return await this.post(data, '/multicast');
    }

    async topicSend(data: any): Promise<Response> {
        return await this.post(data, '/topic');
    }
}