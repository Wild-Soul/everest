const express = require('express');
const userController = require('./../controller/userController');
const router = express.Router();
const authController = require('./../controller/authController');

//ROUTES FOR USERS.
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;