import OktaJwtVerifier from '@okta/jwt-verifier';

export const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-169479.oktapreview.com/oauth2/default',
    clientId: '0oaigopumvEKEibQR0h7',
    assertClaims: {
        aud: 'api://default'
    }
});

export const verifyToken = (accessToken) => {
    return oktaJwtVerifier.verifyAccessToken(accessToken);
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
