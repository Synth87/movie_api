// requiring frameworks and libraries
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

// app encapsulates the functionality of express
const app = express();


// register the middleware function bodyParser globally for all incoming requests
// check for every incoming request if the http body contains json. If true parse the json into a js object.
// the js object is then saved in the request object under req.body and can be used in the following functions
// enables me to read data from the body object. Without this req.body would not be possible.
app.use(bodyParser.json());

// serving static files from the "public" folder
app.use(express.static('public'));
// morgan middleware to log all requests to the terminal
app.use(morgan('common'));



// users array
let users = [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favoriteMovies: ["The French Dispatch"]
    }
];


// movies array
let movies = [
    {
        "Title": "Jurassic Park",
        "Description": "Jurassic Park is a blockbuster film where genetically-engineered dinosaurs wreak havoc in a theme park, putting visitors in peril. The movie explores the consequences of meddling with nature and the struggle for survival in the face of prehistoric giants.",
        "Genre": {
            "Name": "Science Fiction Adventure",
            "Description": "Is a genre that combines futuristic elements with thrilling action and exploration"
        },
        "Director": {
            "Name": "Steven Spielberg",
            "Bio": "Steven Spielberg was born on December 18, 1946, in Cincinnati, Ohio. He's famous for directing many blockbuster movies, such as Jurassic Park, E.T. the Extra-Terrestrial and Schindler's List and he's one of the most influential directors in the history of cinema.",
            "Birth": 1946.0
        },
        "ImageURL": " ",
        "Featured": false
    },
    {
        "Title": "Terminator",
        "Description": "Terminator is a sci-fi thriller where a cyborg assassin is sent back in time to kill a woman whose unborn son will lead a resistance against machines in a post-apocalyptic future.",
        "Genre": {
            "Name": "Science Fiction Thriller",
            "Description": "Is a genre that combines futuristic elements with suspenseful and intense storytelling."
        },
        "Director": {
            "Name": "James Cameron",
            "Bio": "James Cameron was born on August 16, 1954, in Kapuskasing, Ontario, Canada. He's known for directing blockbuster films like Terminator, Titanic, and Avatar and he's a highly acclaimed filmmaker in the industry.",
            "Birth": 1954.0
        },
        "ImageURL": " ",
        "Featured": false
    }
];




// CREATE - a new user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users need names');
    }
})


// UPDATE - user data
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    // let is used because if there is a user the name gets updated
    // "==" because here the id in the array is a number and the id in const is a string
    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        // 200 instead of 201 because it is edited and not created
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user');
    }
})


// CREATE - user add a favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user');
    }
})


// DELETE - user deletes a favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('no such user');
    }
})

// DELETE - user deletes account
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        // "!="" because here the id in the array is a number and the id in const is a string
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user');
    }
})



// READ - return a list of all movies 
app.get('/movies', (req, res) => {
    // sends the array with the movie objects as a JSON response
    res.status(200).json(movies);
});

// READ - return a single movie
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    // checking if a movie in the movie array has the same name as the movie from the URL
    // movie is a parameter in the arrow function passed to the find method
    // the arrow function is called for each element in the movies array with movie representing the current element
    // within the function it checks if the title property of the current movie object equals the searched title
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie');
    }
});

// READ - return data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    // .Genre returns only the genre of the movie and not the whole object from the array
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre');
    }
});


// READ - return data about a director by name
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director');
    }
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
