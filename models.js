const mongoose = require('mongoose');

// defining a schema for documents in the "movies" collection
let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    // Genre and Director both are examples of a "Subdocument"
    // one key can correspond to an embedded subdocument of key-value pairs
    genre: {
        name: String,
        description: String
    },
    director: {
        name: String,
        bio: String
    },
    imagePath: String,
    featured: Boolean
});


// defining a schema for documents in the "users" collection
let userSchema = mongoose.Schema({
    // "required: true" means each user document must have a Username field
    // the value of this field must be a string
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    Birthday: Date,
    // key is defined and its value is set as a piece of data from a different collection
    // "type: mongoose.Schema.Types.ObjectId" indicates that the field will store a MongoDB Object ID
    // defines a FavoriteMovies field as an array of ObjectIds, referencing documents in the Movie collection with "ref:"
    // this establishes a relationship between User and Movie documents in MongoDB
    // ".ObjectId" means that the values in the favoriteMovies array are interpreted as MongoDB ObjectIDs.
    // in the array the IDs get saved as normal strings without any addition
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});


// creation of the models. Creates collections called "db.movies" and "db.users"
// movies and users because the names get "lowercased" and "pluralized"
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// exporting the models to use them in index.js
module.exports.Movie = Movie;
module.exports.User = User;