// import the passport authentication middleware for node.js
const passport = require('passport');

// passport strategy: this one defines my basic HTTP authentication for login requests
const LocalStrategy = require('passport-local').Strategy;

// Imports the models.js file, which contains the Mongoose models
const Models = require('./models.js');

// Imports passport-jwt module
const passportJWT = require('passport-jwt');





// Retrieves the User model from the imported models, for interacting with the users in the database
let Users = Models.Users;

// Extracts the JWT strategy from the passport-jwt package
// it is the Passport strategy for authenticating with a JSON Web Token (JWT)
let JWTStrategy = passportJWT.Strategy;

// Extracts the JWT extraction method from passport-jwt, used to specify how the JWT should be extracted from requests
let ExtractJWT = passportJWT.ExtractJwt;




// Begins the definition of the local authentication strategy using Passport
// (passport.use can be used without requiring express)
// new generates an instance of the class LocalStrategy
passport.use(new LocalStrategy(
    // js object that contains 2 properties
    {
        // Specifies that the Username field in the request body will be used as the username
        usernameField: 'Username',
        passwordField: 'Password',
    },

    // Defines an asynchronous function that Passport will use for the local strategy, passing the username, password, and a callback function
    async (username, password, callback) => {

        // Logs the username and password to the console (not a best practice, especially in production!)
        console.log(`${username} ${password}`);

        // Asynchronously searching for a user in the database with the given username. (Mongoose Model)
        await Users.findOne({ username: username })

            // handles the promise returned from finding the user
            .then((user) => {
                // checks if user is not found
                if (!user) {
                    console.log('incorrect username');
                    // callback is called with null and false, showing that the authentification was not successful
                    // null as a first parameter is a convention
                    return callback(null, false, {
                        // this message is given back to the client
                        message: 'Incorrect username or password.',
                    });
                }
                // if the user was found the callback function is called with null and user to show that the authentification was successful
                console.log('finished');
                return callback(null, user);
            })

            // error handling
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            })
    }
)
);




// definition of the JWT authentication strategy
passport.use(new JWTStrategy(
    {
        // configures the strategy to extract the JWT from the authorization header as a Bearer token
        // this means that the client should send the JWT in the HTTP authorization header
        // the JWT is extracted from the header of the HTTP request
        // this JWT is called the “bearer token”
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        // the secret key that is used to check the validity of the JWT is defined here. (Here it is a placeholder)
        // “secret” key to verify the signature of the JWT. Verifies hat the sender of the JWT (the client) is who it says it is
        secretOrKey: 'your_jwt_secret'
    }, 
    
    // the actual function used by Passport.js for JWT authentication is defined here
    // payload (content) of the JWT, which normally contains user information or other data
    // callback parameter for using the callback function inside the async function
    async (jwtPayload, callback) => {
        // asynchronously searches a user by the ID encoded in the JWT payload.
        return await Users.findById(jwtPayload._id)
            // handles the promise returned from finding the user.
            .then((user) => {
                return callback(null, user);
            })
            // error handling
            .catch((error) => {
                return callback(error)
            });
    }));
// with this JWT code set up, I can use JWT authentication for the rest of the endpoints in my API