import { RtcTokenBuilder, Role as RtcRole } from './rtc_token_builder';

export class AgoraTokenGenerator {
    private appId: string;
    private appCertificate: string;
    private channelName: string;
    private uid: number;
    private account: string;
    private role: RtcRole;
    private tokenExpirationInSecond: number;
    private privilegeExpirationInSecond: number;
    private joinChannelPrivilegeExpireInSeconds: number;
    private pubAudioPrivilegeExpireInSeconds: number;
    private pubVideoPrivilegeExpireInSeconds: number;
    private pubDataStreamPrivilegeExpireInSeconds: number;

    constructor(channelName: string, uid: number, account?: string | undefined) {
        this.appId = process.env.AGORA_APP_ID || '';
        this.appCertificate = process.env.AGORA_APP_CERTIFICATE || '';
        this.channelName = channelName;
        this.uid = uid;
        this.account = account || '';
        this.role = RtcRole.PUBLISHER;
        this.tokenExpirationInSecond = 3600;
        this.privilegeExpirationInSecond = 3600;
        this.joinChannelPrivilegeExpireInSeconds = 3600;
        this.pubAudioPrivilegeExpireInSeconds = 3600;
        this.pubVideoPrivilegeExpireInSeconds = 3600;
        this.pubDataStreamPrivilegeExpireInSeconds = 3600;

        if (this.appId === '' || this.appCertificate === '') {
            console.log('環境変数 AGORA_APP_ID と AGORA_APP_CERTIFICATE を設定する必要があります');
            process.exit(1);
        }
    }

    generateTokenWithUid(): string {
        return RtcTokenBuilder.buildTokenWithUid(
            this.appId,
            this.appCertificate,
            this.channelName,
            this.uid,
            this.role,
            this.tokenExpirationInSecond,
            this.privilegeExpirationInSecond
        );
    }

    // generateTokenWithUserAccount(): string {
    //     return RtcTokenBuilder.buildTokenWithUserAccount(
    //         this.appId,
    //         this.appCertificate,
    //         this.channelName,
    //         this.account,
    //         this.role,
    //         this.tokenExpirationInSecond,
    //         this.privilegeExpirationInSecond
    //     );
    // }

    // generateTokenWithUidAndPrivilege(): string {
    //     return RtcTokenBuilder.buildTokenWithUidAndPrivilege(
    //         this.appId,
    //         this.appCertificate,
    //         this.channelName,
    //         this.uid,
    //         this.tokenExpirationInSecond,
    //         this.joinChannelPrivilegeExpireInSeconds,
    //         this.pubAudioPrivilegeExpireInSeconds,
    //         this.pubVideoPrivilegeExpireInSeconds,
    //         this.pubDataStreamPrivilegeExpireInSeconds
    //     );
    // }

    // generateTokenWithUserAccountAndPrivilege(): string {
    //     return RtcTokenBuilder.buildTokenWithUserAccountAndPrivilege(
    //         this.appId,
    //         this.appCertificate,
    //         this.channelName,
    //         this.account,
    //         this.tokenExpirationInSecond,
    //         this.joinChannelPrivilegeExpireInSeconds,
    //         this.pubAudioPrivilegeExpireInSeconds,
    //         this.pubVideoPrivilegeExpireInSeconds,
    //         this.pubDataStreamPrivilegeExpireInSeconds
    //     );
    // }

    // generateTokenWithRtm(): string {
    //     return RtcTokenBuilder.buildTokenWithRtm(
    //         this.appId,
    //         this.appCertificate,
    //         this.channelName,
    //         this.account,
    //         this.role,
    //         this.tokenExpirationInSecond,
    //         this.privilegeExpirationInSecond
    //     );
    // }
}