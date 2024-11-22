import express from 'express';
import { AgoraTokenGenerator } from './ceretificate';

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORSとヘッダーの設定
app.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    next();
});

// BadRequestのバリデーションをミドルウェアに移動
app.use((req, res, next) => {
    if (req.body.channelName === undefined || req.body.uid === undefined) {
        res.status(400).json({ error: 'Bad Request' });
        return;
    }
    next();
});

// 各トークンを取得するエンドポイント
app.post('/api/tokenWithUid', (req, res) => {
    const { channelName, uid } = req.body;
    try {
        const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid);
        const token = agoraTokenGenerator.generateTokenWithUid();
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/tokenWithUserAccount', (req, res) => {
    const { channelName, uid, account } = req.body;
    try {
        const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid, account);
        const token = agoraTokenGenerator.generateTokenWithUserAccount();
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/tokenWithUidAndPrivilege', (req, res) => {
    const { channelName, uid } = req.body;
    try {
        const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid);
        const token = agoraTokenGenerator.generateTokenWithUidAndPrivilege();
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/tokenWithUserAccountAndPrivilege', (req, res) => {
    const { channelName, uid, account } = req.body;
    try {
        const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid, account);
        const token = agoraTokenGenerator.generateTokenWithUserAccountAndPrivilege();
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/tokenWithRtm', (req, res) => {
    const { channelName, uid, account } = req.body;
    try {
        const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid, account);
        const token = agoraTokenGenerator.generateTokenWithRtm();
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});