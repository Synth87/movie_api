// requiring frameworks and libraries
const express = require('express');
const morgan = require('morgan');
// app encapsulates the functionality of express
const app = express();


// array with top ten movie-objects
let topMovies = [
    {
        title: 'Matrix',
        director: 'Lana and Lilly Wachowski'
    },
    {
        title: 'Blade Runner',
        director: 'Ridley Scott'
    },
    {
        title: 'Alien',
        director: 'Ridley Scott'
    },
    {
        title: 'Aliens',
        director: 'James Cameron'
    },
    {
        title: 'Terminator',
        director: 'James Cameron'
    },
    {
        title: 'Terminator 2',
        director: 'James Cameron'
    },
    {
        title: 'The Fifth Element',
        director: 'Luc Besson'
    },
    {
        title: 'Die Hard',
        director: 'John McTiernan'
    },
    {
        title: 'Jurassic Park',
        director: 'Steven Spielberg'
    },
    {
        title: 'Heat',
        director: 'Michael Mann'
    }
];


// serving static files from the "public" folder
app.use(express.static('public'));
// morgan middleware to log all requests to the terminal
app.use(morgan('common'));



// handlers for GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my favourite movies!');
});

app.get('/movies', (req, res) => {
    // sends the array with the movie objects as a JSON response
    res.json(topMovies);
});



// last handler function is the error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
