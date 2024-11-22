import express from 'express';
import { AgoraTokenGenerator } from './module/agora/ceretificate';
import { AuthenticationService } from './module/firebase/authentication_service';

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORSとヘッダーの設定
app.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    next();
});

// 認証ミドルウェア
app.use(async (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization'];
        if (!bearerHeader) {
            res.status(403).send({ error: 'Forbidden' });
            return;
        }
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        const authService = new AuthenticationService();

        await authService.verifyIdToken(bearerToken);
        next();
    } catch (error) {
        res.status(403).send({ error: 'Forbidden' });
    }
});

// リクエストボディのバリデーション
app.use((req, res, next) => {
    if (req.body.channelName === undefined || req.body.uid === undefined) {
        res.status(400).json({ error: 'Bad Request' });
        return;
    }
    next();
});

// 各トークンを取得するエンドポイント
app.post('/api/token', (req, res) => {
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

// app.post('/api/tokenWithUserAccount', (req, res) => {
//     const { channelName, uid, account } = req.body;
//     try {
//         const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid, account);
//         const token = agoraTokenGenerator.generateTokenWithUserAccount();
//         res.status(200).json({ token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.post('/api/tokenWithUidAndPrivilege', (req, res) => {
//     const { channelName, uid } = req.body;
//     try {
//         const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid);
//         const token = agoraTokenGenerator.generateTokenWithUidAndPrivilege();
//         res.status(200).json({ token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.post('/api/tokenWithUserAccountAndPrivilege', (req, res) => {
//     const { channelName, uid, account } = req.body;
//     try {
//         const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid, account);
//         const token = agoraTokenGenerator.generateTokenWithUserAccountAndPrivilege();
//         res.status(200).json({ token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.post('/api/tokenWithRtm', (req, res) => {
//     const { channelName, uid, account } = req.body;
//     try {
//         const agoraTokenGenerator = new AgoraTokenGenerator(channelName, uid, account);
//         const token = agoraTokenGenerator.generateTokenWithRtm();
//         res.status(200).json({ token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});