const dotenv = require('dotenv');
dotenv.config( {path: './config.env'} );
const app = require('./app');
const mongoose = require('mongoose');

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
app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});