const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser  = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync( async (req,res,next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new AppError('Please provide email and password'));     
    }

    const user = await User.findOne({ email }).select('+password');

    if(!user && !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or passowrd', 401));
    };

    createSendToken(user, 200, res);
});

exports.protect = catchAsync( async (req,res,next) => {
    // 1: Getting token and check if it's there.
    let token = undefined;
    if(req.headers.authorization && req.headers.authorization.startsWtih('Bearer')) {
        token =  req.headers.authorization;
    }

    if(!token) {
        return next(new AppError('You are not logged in', 401));
    }

    // 2: Verification of token.
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3: Check if user still exists.
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The user no longer exists', 401));
    }
    // 4: Check if user changes password after token was issued.
    if(!currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password. Please log in.', 401)
        )
    }

    req.user = currentUser;
    next();
})

exports.restrictTo = (...roles) => {
    return  (req, res, next)  => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Do not have permission', 403));
        }
        next();
    }
}

exports.forgotPassword = async (req, res, next) => {
    // Get user based on POSTed email.
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError('There is no user with that email address'));
    }
    // Generate the random reset token.
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to the user's email.
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    try{
        const message = `Forgot your password ? Submit a PATCH request with your password and reset password to ${resetURL}`;
        await sendEmail({
            email:user.email,
            subject: 'Your password reset token is valid for 10 min',
            message
        })
        
        res.status(200).json({
            satatus: 'success',
            message: 'Token sent to email'
    })} catch {
        user.createPasswordResetToken = undefined,
        user.passwordExpires = undefined,
        await user.save({validateBeforeSave: false})
        return next((new AppError('There was an error sending the email'),500));
    }
};

exports.resetPassword = async (req, res, next) => {
    // 1. Get user based on the password.
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordRestoreToken: hashedToken, passwordRestoreToken: {$gt: Date.now()}});

    // 2. If token is not expired and there is a user.
    if(!user) {
        return next(new AppError('Invalid Token', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordRestoreToken = undefined;
    user.passwordExpires = undefined;
    await user.save();

    // 3. Log the user in and send JWT.
    createSendToken(user, 200, res);
};

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Get user from collection.
    const user = await User.findOne({_id: req.params.id}).select('password');
    // check if POSTed password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    // update password.
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // Log user in, send JWT.
    createSendToken(user, 200, res);
});