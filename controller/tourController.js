const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

// ROUTE HANDLERS.
exports.getAllTours = catchAsync (async (req, res, next) => {

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
});

exports.getTour = catchAsync (async (req, res, next) => {

    const tour = await Tour.findById(req.params.id).populate('reviews');
    // Tour.findOne({ _id: req.params.id });
    if(!tour) {
      return next(new AppError("No tour found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
});

exports.createTour = catchAsync( async (req, res, next) => {
  const newTour = await Tour.create(req.body);
    
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
});

exports.updateTour = catchAsync (async (req, res, next) => {

    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true
      }
    );
    if(!tour) {
      return next(new AppError("No tour found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });

});

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if(!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//   res.status(204).json({
//     status: "success",
//     data: null,
//   });

// });

exports.deleteTour = factory.deleteOne(Tour);