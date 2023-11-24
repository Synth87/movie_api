// requiring frameworks and libraries
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

// requiring the mongoose package and the models.js file (in which the mongoose models are)
const mongoose = require('mongoose');
const Models = require('./models.js');

// extracting the individual models from the Models object
const Movies = Models.Movie;
const Users = Models.User;

// allowing mongoose to connect to my database
// "localhost" did not work. soltuion: use "127.0.0.1" instead.
// mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://127.0.0.1:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });



// app encapsulates the functionality of express
const app = express();



// register the middleware function bodyParser globally for all incoming requests
// check for every incoming request if the http body contains json. If true parse the json into a js object.
// the js object is then saved in the request object under req.body and can be used in the following functions
// enables me to read data from the body object. Without this req.body would not be possible.
app.use(bodyParser.json());
// allows an Express application to parse URL-encoded form data, with "extended: true" enabling the handling of nested objects
app.use(bodyParser.urlencoded({ extended: true }));

// serving static files from the "public" folder
app.use(express.static('public'));
// morgan middleware to log all requests to the terminal
app.use(morgan('common'));






// this code must be after the bodyParser middleware function
// after importing the module, it is immediately called as a function and given the argument "app"
// this ensures that express is available in my auth.js as well
// in detail: I am requiring the function I exported in auth.js and call it with the argument "app".
// This references the express instance in my project. I pass the express-functionality to the function from auth.js
// The argument "app" is passed to the parameter "router" in the arrow function I require from the auth.js file.
let auth = require('./auth.js')(app);



// requiring the passport module
const passport = require('passport');
// requiring the passport.js file with the passport strategies
require('./passport.js');







// Movies
// Get all movies (Mongoose)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Get movie by title (Mongoose)
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ title: req.params.title })
        .then((movie) => {
            if (!movie) {
                return res.status(404).send('Error: ' + req.params.title + ' was not found');
            } else {
                res.status(200).json(movie);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Get genre by name (Mongoose)
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ 'genre.name': req.params.genreName })
        // if the search is successful the whole movie object is given back
        .then((movie) => {
            if (!movie) {
                return res.status(404).send('Error: ' + req.params.genreName + ' was not found');
            } else {
                res.status(200).json(movie.genre);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Get director by name (Mongoose)
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ 'director.name': req.params.directorName })
        .then((movie) => {
            if (!movie) {
                return res.status(404).send('Error: ' + req.params.directorName + ' was not found');
            } else {
                res.status(200).json(movie.director);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});







// Users
// Get all users (Mongoose)
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Get a user by username (Mongoose)
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ username: req.params.username })
        .then((user) => {
            if (!user) {
                return res.status(404).send('Error: ' + req.params.username + ' was not found');
            } else {
                res.status(200).json(user);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// CREATE - a new user (Mongoose)
//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/

// here the password strategy must not be added otherwise a new user can never be added
app.post('/users', async (req, res) => {
    // check if a user with the username provided by the client already exists
    await Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + ' already exists');
            } else {
                // create commands takes an object
                // each key in the object corresponds to a certain field specified in the schema
                // each value is set to a value that I receive from the request body via req.body
                // I can collect all the info from the HTTP request body using Mongoose

                // Mongoose is used to populate a user document and then it is added to the database
                // Mongoose is translating Node.js code into a MongoDB command 
                // This command runs behind the scenes to insert a record into my “Users” collection
                // The app uses Mongoose’s create command on the model to execute this database operation on MongoDB automatically
                Users.create({
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        birthday: req.body.birthday
                    })
                    // after the document is created, a callback takes the document I just added as a parameter
                    // the response contains a status code and the document I just created (called "user")
                    // provides a feedback for the client
                    .then((user) => { res.status(201).json(user) })
                    // error-handling function
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});



// Update a user's info, by username (Mongoose)
/* We’ll expect JSON in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/

app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ username: req.params.username },
        {
            // $set operator replaces the value of a field with the specified value
            // specify which fields in the user document I am updating
            $set:
            {
                // The new values I am setting each of these specific fields to is extracted from the request body
                // this means that they come from a request sent by the user
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                birthday: req.body.birthday
            }
        },
        // { new: true } makes sure that the updated document is returned not the old/original document
        // It specifies that, in the proceeding callback, I want the document that was just updated to be returned
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});



// Add a favorite movie
// Add a movie to a user's list of favorites (Mongoose)
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // searches the Users collection for a document where the Username field matches the value in req.params.Username from the URL
    await Users.findOneAndUpdate({ username: req.params.username }, {
        // If a matching user is found, it uses MongoDB's $addToSet update operator to add the MovieID from req.params.MovieID to the FavoriteMovies array of that user's document.
        $addToSet: { favoriteMovies: req.params.movieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Remove a favorite movie
// Remove a movie from a user's list of favorites (Mongoose)
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // searches the Users collection for a document where the Username field matches the value in req.params.Username from the URL
    await Users.findOneAndUpdate({ username: req.params.username }, {
        // If a matching user is found, it uses MongoDB's $push update operator to add the MovieID from req.params.MovieID to the FavoriteMovies array of that user's document.
        $pull: { favoriteMovies: req.params.movieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Delete a user by username (Mongoose)
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndDelete({ username: req.params.username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});





// if no other handler was successful this handler will be activated.
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    // forwarding error to the next error-handling middleware
    next(error);
});

// last handler function is the error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send('Something broke!');
});




// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
