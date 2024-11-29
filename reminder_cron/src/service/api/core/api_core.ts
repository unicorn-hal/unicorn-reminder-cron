import { FirebaseAuthenticationService } from "../../firebase/authentication_service";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export interface Headers {
    [key: string]: string;
}

export interface Response {
    statusCode: number;
    data: any;
}

export abstract class ApiCore {
    private _axios = axios;
    private _authService: FirebaseAuthenticationService = new FirebaseAuthenticationService();

    private _baseUrl: string = process.env.UNICORN_API_BASEURL;
    private _endpoint: string;
    private _parameters: string;
    private _headers: Headers;

    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    async makeHeaders(): Promise<void> {
        this._headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await this._authService.createToken(),
            'X-UID': process.env.CRON_UID,
        }
    }

    protected async get(parameters?: string): Promise<Response> {
        await this.makeHeaders();
        this._parameters ??= parameters;
        const axiosResponse = await this._axios.get(this._baseUrl + this._endpoint + this._parameters, {
            headers: this._headers,
        });
        const response: Response = {
            statusCode: axiosResponse.status,
            data: axiosResponse.data,
        };
        return response;
    }

    protected async post(data: any, parameters?: string): Promise<Response> {
        await this.makeHeaders();
        this._parameters ??= parameters;
        const axiosResponse = await this._axios.post(this._baseUrl + this._endpoint, data, {
            headers: this._headers,
        });
        const response: Response = {
            statusCode: axiosResponse.status,
            data: axiosResponse.data,
        };
        return response;
    }

    protected async put(data: any, parameters?: string): Promise<Response> {
        await this.makeHeaders();
        this._parameters ??= parameters;
        const axiosResponse = await this._axios.put(this._baseUrl + this._endpoint, data, {
            headers: this._headers,
        });
        const response: Response = {
            statusCode: axiosResponse.status,
            data: axiosResponse.data,
        };
        return response;
    }

    protected async delete(parameters?: string): Promise<Response> {
        await this.makeHeaders();
        this._parameters ??= parameters;
        const axiosResponse = await this._axios.delete(this._baseUrl + this._endpoint + this._parameters, {
            headers: this._headers,
        });
        const response: Response = {
            statusCode: axiosResponse.status,
            data: axiosResponse.data,
        };
        return response;
    }
}