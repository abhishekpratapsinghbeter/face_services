const mongoose = require('mongoose');

const descriptorSchema = new mongoose.Schema({
    userId:{
        type:  mongoose.Schema.Types.ObjectId,
        ref:'Student'
    },
    descriptor:[{
         type: Number,
        
    }]
})


const descriptor = mongoose.model("Descriptor", descriptorSchema);
module.exports = descriptor;