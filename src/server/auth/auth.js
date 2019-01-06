import * as admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

export const verifyToken = (idToken) => {
    return admin.auth().verifyIdToken(idToken);
};

export const authRequired = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);

    if (!match) {
        res.status(401);
        return next('Unauthorized');
    }
    const accessToken = match[1];

    return verifyToken(accessToken)
        .then((jwt) => {
            req.jwt = jwt;
            next();
        })
        .catch((err) => {
            res.status(401).send(err.message);
        });
};
