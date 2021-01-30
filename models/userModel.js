const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User has to have a name']
    },
    email: {
        type: String,
        required: [true, 'Email is needed for verification'],
        unique: true,
        lowercase: true,
        validate:  [validator.isEmail, 'Please enter a valid email'],
    },
    photo: String,
    roles: {
        type: String,
        enum: ['user','guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el) {
                return this.password === el;
            },
            message: "Password and confirm password do not match",
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: true
    }
});

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp =  parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(this.passwordChangedAt, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10*60*1000;

    return resetToken;
}

userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}});
    next();
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password') || this.isNew()) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;