const Users = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeature');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach( el => {
        if(allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    })
    return newObj;
}

exports.getAllUsers = catchAsync( async (req,res) => {
    const users = await Users.find();
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    })
});

exports.createUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
}

exports.updateUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
}

exports.getUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
}

exports.deleteUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined"
    });
}

exports.updateMe = catchAsync( async(req, res, next) => {
    // 1. Create error if user tries to update the password.
    if(req.body.password || req.body.confirmPassword) {
        return next(new AppError('Not for password updates', 400));
    }

    // 2. Update the user document.
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
});