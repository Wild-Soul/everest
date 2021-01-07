const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.paht}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0]
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const error = Object.values(err.errors).map(er => er.message);
    const message = `Invalid input data: ${error}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err,res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
           stack: err.stack,
    })
}

const sendErrorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'oops something went wrong'
        })
    }
}

module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === 'production') {
        let error = {...err};
        if(error.name === 'CaseError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name == 'validationError') handleValidationErrorDB(error);
        sendErrorProd(error, res);
    }
    return res;
}