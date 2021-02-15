const express = require("express");
const morgan = require("morgan");
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRoutes');

const globalErrorHandler = require('./controller/errorController');
const { mongo } = require("mongoose");

app = express();
//MIDDLEWARES.
app.use(helmet());
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: 'Too many request fro this IP, please try again in an hour'
});

app.use('/api', limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static((`${__dirname}/public`)))

// ROUTE HANDLERS FOR USER.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*',(req,res,next) => {
    // const err = new Error(`Can't find the ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find the ${req.originalUrl} on this server!`,404));
});

app.use(globalErrorHandler);

module.exports = app