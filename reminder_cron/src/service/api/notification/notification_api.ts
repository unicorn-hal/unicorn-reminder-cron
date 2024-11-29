import { ApiCore, Response } from "../core/api_core";

export interface SendNotificationRequest {
    title: string;
    body: string;
    token: string;
}

export interface MultiSendNotificationRequest {
    title: string;
    body: string;
    tokens: string[];
}

export interface TopicSendNotificationRequest {
    title: string;
    body: string;
    topic: string;
}

export class NotificationApi extends ApiCore {
    constructor() {
        super({ baseUrl: 'notification-server', endpoint: '' });
    }

    async send(data: SendNotificationRequest): Promise<Response> {
        return await this.post(data, '/send');
    }

    async multiSend(data: MultiSendNotificationRequest): Promise<Response> {
        return await this.post(data, '/multicast');
    }

    async topicSend(data: TopicSendNotificationRequest): Promise<Response> {
        return await this.post(data, '/topic');
    }
}