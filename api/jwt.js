const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

// Authentication middleware. When used, the
// access token must exist and be verified against
// the Auth0 JSON Web Key Set
// Dynamically provide a signing key
// based on the kid in the header and 
// the signing keys provided by the JWKS endpoint.

module.exports = {
    validator: jwt({  audience: 'urn:api:nyx:pesca',
                        issuer: `https://nyxk.auth0.com/`,
                    algorithms: ['RS256'],
                        secret: jwksRsa.expressJwtSecret({ cache: true,
                                                       rateLimit: true,
                                           jwksRequestsPerMinute: 5,
                                                         jwksUri: `https://nyxk.auth0.com/.well-known/jwks.json` })
                   }), 

    errorHandler: function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send(err.message);
            return;
        }

        next();
    }
};
