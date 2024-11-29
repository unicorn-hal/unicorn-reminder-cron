import { FirebaseCore } from "./core/firebase_core";
import { auth } from "firebase-admin";

export class FirebaseAuthenticationService extends FirebaseCore {
    private _auth: auth.Auth;
    private _uid: string = process.env.CRON_UID;

    constructor() {
        super();
        this._auth = auth(this.app);
    }

    async createToken(): Promise<string> {
        const customToken = await this._auth.createCustomToken(this._uid);
        return customToken;
    }
}