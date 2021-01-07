const express = require("express");
const morgan = require("morgan");
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const globalErrorHandler = require('./controller/errorController');
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

app.all('*',(req,res,next) => {
    // const err = new Error(`Can't find the ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find the ${req.originalUrl} on this server!`,404));
});

app.use(globalErrorHandler);

module.exports = app