const mongoose=require('mongoose');
const Review = require('./review')
const Schema=mongoose.Schema;

const CandidateSchema=new Schema({
    name:String,
    gender:String,
    nationality:String,
    email:String,
    phone: Number,
    images:[
        {url: String,
        filename: String
    }
    ],
    objective: String,
    skills:String,
    qualification:String,
    percentage:Number,
    experience:String,
    projects:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CandidateSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('Candidate',CandidateSchema);