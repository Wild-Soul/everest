const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review:{
            type: String,
            required: [true, 'Please type something in review']
        },
        rating:{
            type: Number,
            min: 1,
            max: 5
        },
        createdAt:{
            type: Date,
            default: Date.now()
        },
        user:{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        },
        tour:{
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        }
    },
    {
        toJson:  {virtuals: true},
        toObject: {virtuals: true}
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    // this.populate({
    //     path: 'user',
    //     select: 'name photo'
    // });
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    };
}

reviewSchema.post('save', function() {
    // this points to current review.
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.currentReview = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.currentReview.constructor.calcAverageRatings(this.currentReview.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;