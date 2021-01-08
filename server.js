const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! => Shutting down');
  console.log(err.name, err.message);
  process.exit(1);
})

dotenv.config( {path: './config.env'} );
const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWD);
// console.log(process.env);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then( con => {
    // console.log(con.connections);
    console.log('DB Connected Successfully');
  })

const port = process.env.PORT || 3001;
// console.log(app);

// console.log(app)
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

process.on('unhadledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandeled Rejection => Shutting down');
  server.close(() =>{
    process.exit(1);
  })
})