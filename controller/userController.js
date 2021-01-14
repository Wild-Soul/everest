const Users = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeature');

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