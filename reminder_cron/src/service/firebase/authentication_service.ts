import { FirebaseCore } from "./core/firebase_core";
import { Auth, getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';

export class FirebaseAuthenticationService extends FirebaseCore {
    private _auth: Auth;
    private _userCredential: UserCredential;

    constructor() {
        super();
        this._auth = getAuth(this.app);
    }

    async _singIn(): Promise<void> {
        this._userCredential = await signInWithEmailAndPassword(this._auth, process.env.CRON_EMAIL, process.env.CRON_PASSWORD);
    }

    async createToken(): Promise<string> {
        if (!this._userCredential) {
            await this._singIn();
        }
        if (!this._userCredential.user.emailVerified) {
            await this._userCredential.user.reload();
        }
        return await this._userCredential.user.getIdToken(true);
    }
}