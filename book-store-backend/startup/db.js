const mongoose = require('mongoose');

//DB config
const db = require('../config/keys').mongoURI;

//Connect to MongoDB
function connectDB(){
    mongoose.connect(
        db, 
        { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        }
        
    )
    .then( () => console.log('Connected successfuly to MongoDB...'))
    .catch(err => {
        console.log(`Could not connect to MongoDB. Error: ${err}`);
        process.exit(1);
    });
}

module.exports = connectDB;