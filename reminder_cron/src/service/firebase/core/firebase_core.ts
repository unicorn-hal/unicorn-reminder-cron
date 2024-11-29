import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import firebaseConfig from '../../../config/firebase/firebaseConfig.json';
import dotenv from 'dotenv';
dotenv.config();

export class FirebaseCore {
    private _app: FirebaseApp;

    constructor() {
        this._initializeApp();
    }

    get app(): FirebaseApp {
        return this._app;
    }

    private _initializeApp() {
        console.log('Initializing Firebase app...');

        let alreadyInitialized = false;
        for (const app of getApps()) {
            if (app.name === '[DEFAULT]') {
                this._app = app;
                alreadyInitialized = true;
                break;
            }
        }
        if (alreadyInitialized) {
            return;
        }

        this._app = initializeApp(firebaseConfig);
    }
}