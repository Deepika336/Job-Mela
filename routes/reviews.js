const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Candidate = require('../models/candidate');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');





router.post('/',isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const candidate = await Candidate.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    candidate.reviews.push(review);
    await review.save();
    await candidate.save();
    req.flash('success', 'Created new job offer!');
    res.redirect(`/candidates/${candidate._id}`);
}))

router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Candidate.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the job offer')
    res.redirect(`/candidates/${id}`);
}))

module.exports = router;