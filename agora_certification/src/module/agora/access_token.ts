import * as crypto from 'crypto';
import * as zlib from 'zlib';

const VERSION_LENGTH = 3;
const APP_ID_LENGTH = 32;

const getVersion = (): string => {
    return '007';
};

class Service {
    protected __type: number;
    protected __privileges: { [key: number]: number };

    constructor(service_type: number) {
        this.__type = service_type;
        this.__privileges = {};
    }

    protected __pack_type(): Buffer {
        const buf = new ByteBuf();
        buf.putUint16(this.__type);
        return buf.pack();
    }

    protected __pack_privileges(): Buffer {
        const buf = new ByteBuf();
        buf.putTreeMapUInt32(this.__privileges);
        return buf.pack();
    }

    public service_type(): number {
        return this.__type;
    }

    public add_privilege(privilege: number, expire: number): void {
        this.__privileges[privilege] = expire;
    }

    public pack(): Buffer {
        return Buffer.concat([this.__pack_type(), this.__pack_privileges()]);
    }

    public unpack(buffer: Buffer): ReadByteBuf {
        const bufReader = new ReadByteBuf(buffer);
        this.__privileges = bufReader.getTreeMapUInt32();
        return bufReader;
    }
}

const kRtcServiceType = 1;

class ServiceRtc extends Service {
    private __channel_name: string;
    private __uid: string;

    static kPrivilegeJoinChannel = 1;
    static kPrivilegePublishAudioStream = 2;
    static kPrivilegePublishVideoStream = 3;
    static kPrivilegePublishDataStream = 4;

    constructor(channel_name: string, uid: number | string) {
        super(kRtcServiceType);
        this.__channel_name = channel_name;
        this.__uid = uid === 0 ? '' : `${uid}`;
    }

    public pack(): Buffer {
        const buffer = new ByteBuf();
        buffer.putString(this.__channel_name).putString(this.__uid);
        return Buffer.concat([super.pack(), buffer.pack()]);
    }

    public unpack(buffer: Buffer): ReadByteBuf {
        const bufReader = super.unpack(buffer);
        this.__channel_name = bufReader.getString().toString();
        this.__uid = bufReader.getString().toString();
        return bufReader;
    }
}

const kRtmServiceType = 2;

class ServiceRtm extends Service {
    private __user_id: string;

    static kPrivilegeLogin = 1;

    constructor(user_id?: string) {
        super(kRtmServiceType);
        this.__user_id = user_id || '';
    }

    public pack(): Buffer {
        const buffer = new ByteBuf();
        buffer.putString(this.__user_id);
        return Buffer.concat([super.pack(), buffer.pack()]);
    }

    public unpack(buffer: Buffer): ReadByteBuf {
        const bufReader = super.unpack(buffer);
        this.__user_id = bufReader.getString().toString();
        return bufReader;
    }
}

const kFpaServiceType = 4;

class ServiceFpa extends Service {
    static kPrivilegeLogin = 1;

    constructor() {
        super(kFpaServiceType);
    }

    public pack(): Buffer {
        return super.pack();
    }

    public unpack(buffer: Buffer): ReadByteBuf {
        return super.unpack(buffer);
    }
}

const kChatServiceType = 5;

class ServiceChat extends Service {
    private __user_id: string;

    static kPrivilegeUser = 1;
    static kPrivilegeApp = 2;

    constructor(user_id?: string) {
        super(kChatServiceType);
        this.__user_id = user_id || '';
    }

    public pack(): Buffer {
        const buffer = new ByteBuf();
        buffer.putString(this.__user_id);
        return Buffer.concat([super.pack(), buffer.pack()]);
    }

    public unpack(buffer: Buffer): ReadByteBuf {
        const bufReader = super.unpack(buffer);
        this.__user_id = bufReader.getString().toString();
        return bufReader;
    }
}

const kApaasServiceType = 7;

class ServiceApaas extends Service {
    private __room_uuid: string;
    private __user_uuid: string;
    private __role: number;

    static PRIVILEGE_ROOM_USER = 1;
    static PRIVILEGE_USER = 2;
    static PRIVILEGE_APP = 3;

    constructor(roomUuid?: string, userUuid?: string, role?: number) {
        super(kApaasServiceType);
        this.__room_uuid = roomUuid || '';
        this.__user_uuid = userUuid || '';
        this.__role = role || -1;
    }

    public pack(): Buffer {
        const buffer = new ByteBuf();
        buffer.putString(this.__room_uuid);
        buffer.putString(this.__user_uuid);
        buffer.putInt16(this.__role);
        return Buffer.concat([super.pack(), buffer.pack()]);
    }

    public unpack(buffer: Buffer): ReadByteBuf {
        const bufReader = super.unpack(buffer);
        this.__room_uuid = bufReader.getString().toString();
        this.__user_uuid = bufReader.getString().toString();
        this.__role = bufReader.getInt16();
        return bufReader;
    }
}

class AccessToken2 {
    public appId: string;
    public appCertificate: string;
    public issueTs: number;
    public expire: number;
    public salt: number;
    public services: { [key: number]: Service };

    static kServices: { [key: number]: any } = {};

    constructor(appId: string, appCertificate: string, issueTs?: number, expire?: number) {
        this.appId = appId;
        this.appCertificate = appCertificate;
        this.issueTs = issueTs || Math.floor(Date.now() / 1000);
        this.expire = expire || 0;
        this.salt = Math.floor(Math.random() * 99999999) + 1;
        this.services = {};
    }

    private __signing(): Buffer {
        let signing = encodeHMac(new ByteBuf().putUint32(this.issueTs).pack(), Buffer.from(this.appCertificate, 'utf-8'));
        signing = encodeHMac(new ByteBuf().putUint32(this.salt).pack(), signing);
        return signing;
    }

    private __build_check(): boolean {
        const is_uuid = (data: string): boolean => {
            if (data.length !== APP_ID_LENGTH) {
                return false;
            }
            const buf = Buffer.from(data, 'hex');
            return !!buf;
        };

        const { appId, appCertificate, services } = this;
        if (!is_uuid(appId) || !is_uuid(appCertificate)) {
            return false;
        }

        if (Object.keys(services).length === 0) {
            return false;
        }
        return true;
    }

    public add_service(service: Service): void {
        this.services[service.service_type()] = service;
    }

    public build(): string {
        if (!this.__build_check()) {
            return '';
        }

        const signing = this.__signing();
        let signing_info = new ByteBuf()
            .putString(this.appId)
            .putUint32(this.issueTs)
            .putUint32(this.expire)
            .putUint32(this.salt)
            .putUint16(Object.keys(this.services).length)
            .pack();
        Object.values(this.services).forEach(service => {
            signing_info = Buffer.concat([signing_info, service.pack()]);
        });

        const signature = encodeHMac(signing, signing_info);
        const content = Buffer.concat([new ByteBuf().putString(signature.toString('utf-8')).pack(), signing_info]);
        const compressed = zlib.deflateSync(content);
        return `${getVersion()}${compressed.toString('base64')}`;
    }

    public from_string(origin_token: string): boolean {
        const origin_version = origin_token.substring(0, VERSION_LENGTH);
        if (origin_version !== getVersion()) {
            return false;
        }

        const origin_content = origin_token.substring(VERSION_LENGTH);
        const buffer = zlib.inflateSync(Buffer.from(origin_content, 'base64'));
        const bufferReader = new ReadByteBuf(buffer);

        const signature = bufferReader.getString();
        this.appId = bufferReader.getString().toString();
        this.issueTs = bufferReader.getUint32();
        this.expire = bufferReader.getUint32();
        this.salt = bufferReader.getUint32();
        const service_count = bufferReader.getUint16();

        let remainBuf = bufferReader.pack();
        for (let i = 0; i < service_count; i++) {
            const bufferReaderService = new ReadByteBuf(remainBuf);
            const service_type = bufferReaderService.getUint16();
            const ServiceClass = AccessToken2.kServices[service_type];
            const service = new ServiceClass();
            remainBuf = service.unpack(bufferReaderService.pack()).pack();
            this.services[service_type] = service;
        }

        return true;
    }
}

const encodeHMac = (key: Buffer, message: Buffer): Buffer => {
    return crypto.createHmac('sha256', key).update(message).digest();
};

class ByteBuf {
    private buffer: Buffer;
    private position: number;

    constructor() {
        this.buffer = Buffer.alloc(1024);
        this.position = 0;
        this.buffer.fill(0);
    }

    public pack(): Buffer {
        const out = Buffer.alloc(this.position);
        this.buffer.copy(out, 0, 0, out.length);
        return out;
    }

    public putUint16(v: number): ByteBuf {
        this.buffer.writeUInt16LE(v, this.position);
        this.position += 2;
        return this;
    }

    public putUint32(v: number): ByteBuf {
        this.buffer.writeUInt32LE(v, this.position);
        this.position += 4;
        return this;
    }

    public putInt16(v: number): ByteBuf {
        this.buffer.writeInt16LE(v, this.position);
        this.position += 2;
        return this;
    }

    public putInt32(v: number): ByteBuf {
        this.buffer.writeInt32LE(v, this.position);
        this.position += 4;
        return this;
    }

    public putBytes(bytes: Buffer): ByteBuf {
        this.putUint16(bytes.length);
        bytes.copy(this.buffer, this.position);
        this.position += bytes.length;
        return this;
    }

    public putString(str: string): ByteBuf {
        return this.putBytes(Buffer.from(str, 'utf-8'));
    }

    public putTreeMap(map: { [key: number]: string }): ByteBuf {
        if (!map) {
            this.putUint16(0);
            return this;
        }

        this.putUint16(Object.keys(map).length);
        for (const key in map) {
            this.putUint16(Number(key));
            this.putString(map[key]);
        }

        return this;
    }

    public putTreeMapUInt32(map: { [key: number]: number }): ByteBuf {
        if (!map) {
            this.putUint16(0);
            return this;
        }

        this.putUint16(Object.keys(map).length);
        for (const key in map) {
            this.putUint16(Number(key));
            this.putUint32(map[key]);
        }

        return this;
    }
}

class ReadByteBuf {
    private buffer: Buffer;
    private position: number;

    constructor(bytes: Buffer) {
        this.buffer = bytes;
        this.position = 0;
    }

    public getUint16(): number {
        const ret = this.buffer.readUInt16LE(this.position);
        this.position += 2;
        return ret;
    }

    public getUint32(): number {
        const ret = this.buffer.readUInt32LE(this.position);
        this.position += 4;
        return ret;
    }

    public getInt16(): number {
        const ret = this.buffer.readInt16LE(this.position);
        this.position += 2;
        return ret;
    }

    public getString(): Buffer {
        const len = this.getUint16();
        const out = Buffer.alloc(len);
        this.buffer.copy(out, 0, this.position, this.position + len);
        this.position += len;
        return out;
    }

    public getTreeMapUInt32(): { [key: number]: number } {
        const map: { [key: number]: number } = {};
        const len = this.getUint16();
        for (let i = 0; i < len; i++) {
            const key = this.getUint16();
            const value = this.getUint32();
            map[key] = value;
        }
        return map;
    }

    public pack(): Buffer {
        return this.buffer.slice(this.position);
    }
}

AccessToken2.kServices[kApaasServiceType] = ServiceApaas;
AccessToken2.kServices[kChatServiceType] = ServiceChat;
AccessToken2.kServices[kFpaServiceType] = ServiceFpa;
AccessToken2.kServices[kRtcServiceType] = ServiceRtc;
AccessToken2.kServices[kRtmServiceType] = ServiceRtm;

export {
    AccessToken2,
    kApaasServiceType,
    kChatServiceType,
    kFpaServiceType,
    kRtcServiceType,
    kRtmServiceType,
    ServiceApaas,
    ServiceChat,
    ServiceFpa,
    ServiceRtc,
    ServiceRtm
};