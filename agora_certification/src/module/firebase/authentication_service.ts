import { FirebaseCore } from "../core/firebase_core";
import * as admin from 'firebase-admin';

export class AuthenticationService extends FirebaseCore {
    async verifyIdToken(idToken: string) {
        console.log('Verifying ID token...');
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log('Successfully verified ID token:', decodedToken);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying ID token:', error);
            throw error;
        }
    }
}