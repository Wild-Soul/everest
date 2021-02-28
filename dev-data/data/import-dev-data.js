const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({path: `${__dirname}/../../config.env`});
const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then( con => {
        console.log('DB Connected Successfully');
    })
    .catch( () => console.log("ERROR CONNECTING TO DATABASE") );

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        await Review.create(reviews);
        await User.create(users, {validateBeforeSave: false});
        console.log("DATA IMPORTED SUCCESFULLY");
    } catch(err) {
        console.log(err);
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log("DELETED DATA SUCCESSFULLY");
    } catch (err) {
        console.log(err);
    }
}

if( process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}