const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');


dotenv.config({path: `${__dirname}/../../config.env`});
const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWD);

console.log(DB);
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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    console.log(tours);
    try {
        await Tour.create(tours)
        console.log("DATA IMPORTED SUCCESFULLY");
    } catch(err) {
        console.log("ERROR");
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
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