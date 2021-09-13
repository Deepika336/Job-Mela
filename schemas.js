const Joi = require('joi');

 




module.exports.candidateSchema = Joi.object({
    candidate: Joi.object({
        name: Joi.string().required(),
        gender: Joi.string().required(),
        nationality: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.number().required().min(0),
        //image: Joi.string().required(),
       objective: Joi.string().required(),
       skills: Joi.string().required(),
       qualification: Joi.string().required(),
       percentage:Joi.number().required(),
       experience:Joi.string().required(),
       projects: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()

});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})