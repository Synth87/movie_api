
// this has to be the same key used in the JWTStrategy
const jwtSecret = 'your_jwt_secret';

// required to create JWTs
const jwt = require('jsonwebtoken');
const passport = require('passport');
// requiring the passport.js file
require('./passport');





// defining a function for creating the JWT. 'user' contains the data of the authenticated user.
let generateJWTToken = (user) => {

    // jwt.sign takes an object (typically user data or other vital info) and encodes it as the token's payload
    // token is signed with a secret key, ensuring it can be verified later to confirm data authenticity
    // when creating the token, options can be set, such as expiresIn and algorithm for the signing algorithm used
    return jwt.sign(user, jwtSecret, {
        subject: user.username, // This is the username you’re encoding in the JWT
        expiresIn: '7d', // This specifies that the token will expire in 7 days. Then the user's session will end. New login needed.
        algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
    });
}




/* POST login. */
// only this codeblock is exported that it can be required in the index.js
// the function "generateJWTToken" is not exported but in this file it is in the scope of the function below
// this is why the function "generateJWTToken" can be used in index.js
// important: module.exports gives back a function that expects a parameter (a router object) when called.
// This is important when I require and call the function in the index.js. I have to pass the "app"-object to the function.
module.exports = (router) => {
    // defines a POST-route for the login process
    router.post('/login', (req, res) => {
        // function to authenticate the user. If the user is authenticated, create a JWT and send a response with this token and user information
        // using the local strategy (http authentication) of passport.js to authenticate users
        // structure of the function: "passport.authenticate(authentication strategy e.g. local, { session: false }, callback)"
        // on successful authentication this function gives back a user object used for token generation and response
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }

            // Despite { session: false } disabling sessions, req.login is still needed to handle internal tasks in Passport
            // req.login manually registers the user in Passport, necessary even without session-based authentication.
            // After successful login, the callback generates and sends back the JWT, using req.login to register user data in Passport
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                // using the user object as an input to generate the token
                let token = generateJWTToken(user.toJSON());
                // the user object is sent back together with the JWT token
                // the JWT is stored on the client computer
                // this means "res.json({ user: user, token: token })"
                return res.json({ user, token });
            });
        })(req, res); // immediate execution of the middleware when a POST request is made to '/login'

    });
}