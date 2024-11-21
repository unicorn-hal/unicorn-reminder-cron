import { AccessToken2 as AccessToken } from './access_token';
import { ServiceRtc } from './access_token';
import { ServiceRtm } from './access_token';

enum Role {
    /**
     * 推奨。音声/ビデオ通話やライブブロードキャストの場合、このロールを使用します。
     */
    PUBLISHER = 1,

    /**
     * [Co-host](https://docs.agora.io/en/video-calling/get-started/authentication-workflow?#co-host-token-authentication)の認証が必要な場合のみ、このロールを使用します。
     *
     * @note このロールを有効にするには、サポートチームに連絡してホスティングインの認証を有効にしてもらう必要があります。そうでない場合、Role_SUBSCRIBERはRole_PUBLISHERと同じ特権を持ちます。
     */
    SUBSCRIBER = 2,
}

class RtcTokenBuilder {
    /**
     * 整数のuidを使用してRTCトークンを生成します。
     * @param appId Agoraから発行されたApp ID。
     * @param appCertificate Agora Dashboardで登録したアプリケーションの証明書。
     * @param channelName AgoraRTCセッションのユニークなチャンネル名。文字列の長さは64バイト未満である必要があります。サポートされている文字は次のとおりです：
     * - 小文字の英字：a〜z
     * - 大文字の英字：A〜Z
     * - 数字：0〜9
     * - スペース
     * - 特殊文字："!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", "{", "}", "|", "~", ","
     * @param uid ユーザーID。1から(2^32-1)までの32ビットの符号なし整数。
     * @param role Roleの種類。Role.PUBLISHERまたはRole.SUBSCRIBER。
     * @param tokenExpire トークンの有効期限（秒単位）。
     * @param privilegeExpire 特権の有効期限（秒単位）。
     * @return 生成されたRTCトークン。
     */
    static buildTokenWithUid(
        appId: string,
        appCertificate: string,
        channelName: string,
        uid: number,
        role: Role,
        tokenExpire: number,
        privilegeExpire: number = 0
    ): string {
        return this.buildTokenWithUserAccount(
            appId,
            appCertificate,
            channelName,
            uid.toString(),
            role,
            tokenExpire,
            privilegeExpire
        );
    }

    /**
     * アカウントを使用してRTCトークンを生成します。
     * @param appId Agoraから発行されたApp ID。
     * @param appCertificate Agora Dashboardで登録したアプリケーションの証明書。
     * @param channelName AgoraRTCセッションのユニークなチャンネル名。
     * @param account ユーザーアカウント。
     * @param role Roleの種類。Role.PUBLISHERまたはRole.SUBSCRIBER。
     * @param tokenExpire トークンの有効期限（秒単位）。
     * @param privilegeExpire 特権の有効期限（秒単位）。
     * @return 生成されたRTCトークン。
     */
    static buildTokenWithUserAccount(
        appId: string,
        appCertificate: string,
        channelName: string,
        account: string,
        role: Role,
        tokenExpire: number,
        privilegeExpire: number = 0
    ): string {
        const token = new AccessToken(appId, appCertificate, 0, tokenExpire);

        const serviceRtc = new ServiceRtc(channelName, account);
        serviceRtc.add_privilege(ServiceRtc.kPrivilegeJoinChannel, privilegeExpire);
        if (role === Role.PUBLISHER) {
            serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, privilegeExpire);
            serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, privilegeExpire);
            serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishDataStream, privilegeExpire);
        }
        token.add_service(serviceRtc);

        return token.build();
    }

    /**
     * 指定された特権を持つRTCトークンを生成します。
     * @param appId Agoraから発行されたApp ID。
     * @param appCertificate Agora Dashboardで登録したアプリケーションの証明書。
     * @param channelName AgoraRTCセッションのユニークなチャンネル名。
     * @param uid ユーザーID。
     * @param tokenExpire トークンの有効期限（秒単位）。
     * @param joinChannelPrivilegeExpire チャネル参加特権の有効期限（秒単位）。
     * @param pubAudioPrivilegeExpire 音声公開特権の有効期限（秒単位）。
     * @param pubVideoPrivilegeExpire ビデオ公開特権の有効期限（秒単位）。
     * @param pubDataStreamPrivilegeExpire データストリーム公開特権の有効期限（秒単位）。
     * @return 生成されたRTCトークン。
     */
    static buildTokenWithUidAndPrivilege(
        appId: string,
        appCertificate: string,
        channelName: string,
        uid: number,
        tokenExpire: number,
        joinChannelPrivilegeExpire: number,
        pubAudioPrivilegeExpire: number,
        pubVideoPrivilegeExpire: number,
        pubDataStreamPrivilegeExpire: number
    ): string {
        return this.buildTokenWithUserAccountAndPrivilege(
            appId,
            appCertificate,
            channelName,
            uid.toString(),
            tokenExpire,
            joinChannelPrivilegeExpire,
            pubAudioPrivilegeExpire,
            pubVideoPrivilegeExpire,
            pubDataStreamPrivilegeExpire
        );
    }

    /**
     * 指定された特権を持つRTCトークンを生成します。
     * @param appId Agoraから発行されたApp ID。
     * @param appCertificate Agora Dashboardで登録したアプリケーションの証明書。
     * @param channelName AgoraRTCセッションのユニークなチャンネル名。
     * @param account ユーザーアカウント。
     * @param tokenExpire トークンの有効期限（秒単位）。
     * @param joinChannelPrivilegeExpire チャネル参加特権の有効期限（秒単位）。
     * @param pubAudioPrivilegeExpire 音声公開特権の有効期限（秒単位）。
     * @param pubVideoPrivilegeExpire ビデオ公開特権の有効期限（秒単位）。
     * @param pubDataStreamPrivilegeExpire データストリーム公開特権の有効期限（秒単位）。
     * @return 生成されたRTCトークン。
     */
    static buildTokenWithUserAccountAndPrivilege(
        appId: string,
        appCertificate: string,
        channelName: string,
        account: string,
        tokenExpire: number,
        joinChannelPrivilegeExpire: number,
        pubAudioPrivilegeExpire: number,
        pubVideoPrivilegeExpire: number,
        pubDataStreamPrivilegeExpire: number
    ): string {
        const token = new AccessToken(appId, appCertificate, 0, tokenExpire);

        const serviceRtc = new ServiceRtc(channelName, account);
        serviceRtc.add_privilege(ServiceRtc.kPrivilegeJoinChannel, joinChannelPrivilegeExpire);
        serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, pubAudioPrivilegeExpire);
        serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, pubVideoPrivilegeExpire);
        serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishDataStream, pubDataStreamPrivilegeExpire);
        token.add_service(serviceRtc);

        return token.build();
    }

    /**
     * アカウントを使用してRTCとRTMのトークンを生成します。
     * @param appId Agoraから発行されたApp ID。
     * @param appCertificate Agora Dashboardで登録したアプリケーションの証明書。
     * @param channelName AgoraRTCセッションのユニークなチャンネル名。
     * @param account ユーザーアカウント。
     * @param role Roleの種類。Role.PUBLISHERまたはRole.SUBSCRIBER。
     * @param tokenExpire トークンの有効期限（秒単位）。
     * @param privilegeExpire 特権の有効期限（秒単位）。
     * @return 生成されたRTCとRTMトークン。
     */
    static buildTokenWithRtm(
        appId: string,
        appCertificate: string,
        channelName: string,
        account: string,
        role: Role,
        tokenExpire: number,
        privilegeExpire: number = 0
    ): string {
        const token = new AccessToken(appId, appCertificate, 0, tokenExpire);

        const serviceRtc = new ServiceRtc(channelName, account);
        serviceRtc.add_privilege(ServiceRtc.kPrivilegeJoinChannel, privilegeExpire);
        if (role === Role.PUBLISHER) {
            serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, privilegeExpire);
            serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, privilegeExpire);
            serviceRtc.add_privilege(ServiceRtc.kPrivilegePublishDataStream, privilegeExpire);
        }
        token.add_service(serviceRtc);

        const serviceRtm = new ServiceRtm(account);
        serviceRtm.add_privilege(ServiceRtm.kPrivilegeLogin, tokenExpire);
        token.add_service(serviceRtm);

        return token.build();
    }
}

export { RtcTokenBuilder, Role };