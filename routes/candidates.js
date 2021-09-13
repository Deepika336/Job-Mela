const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCandidate } = require('../middleware');
const { cloudinary } = require("../cloudinary");
const Candidate = require('../models/candidate');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.get('/', catchAsync(async (req, res) => {
    var noMatch=null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const candidates = await Candidate.find({qualification:regex});
        if(candidates.length<1){
            noMatch="No candidates match that query,please try again!!!";
          }
    res.render('candidate/index', { candidates, noMatch:noMatch })
    }

    else{
        const candidates = await Candidate.find({});
    res.render('candidate/index', { candidates, noMatch: noMatch })
}
   
    
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('candidate/new');
})


router.post('/', isLoggedIn, upload.array('image') ,validateCandidate, catchAsync(async (req, res, next) => {
    const candidate = new Candidate(req.body.candidate);
    candidate.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    candidate.author = req.user._id;
    await candidate.save();
    req.flash('success', 'Successfully made a new Resume!');
    res.redirect(`/candidates/${candidate._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const candidate = await Candidate.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(candidate);
    if (!candidate) {
        req.flash('error', 'Cannot find that candidate!');
        return res.redirect('/candidates');
    }
    res.render('candidate/show', { candidate });
}));



router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const candidate = await Candidate.findById(id)
    if (!candidate) {
        req.flash('error', 'Cannot find that candidate!');
        return res.redirect('/candidates');
    }
    res.render('candidate/edit', { candidate });
}))

router.put('/:id',isLoggedIn,isAuthor, upload.array('image'),validateCandidate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndUpdate(id, { ...req.body.candidate });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    candidate.images.push(...imgs);
    await candidate.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await candidate.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    
    req.flash('success', 'Successfully updated resume!');
    res.redirect(`/candidates/${candidate._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Candidate.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted resume!')
    res.redirect('/candidates');
}));


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;