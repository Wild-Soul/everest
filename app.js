const express = require("express");
const morgan = require("morgan");

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app = express();
//MIDDLEWARES.
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static((`${__dirname}/public`)))

// ROUTE HANDLERS FOR USER.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app