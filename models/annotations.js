const mongoose = require('mongoose')

const annotationsSchema = new mongoose.Schema({
    user_id:{
        type: Number,
        required: true
    },
    image_id:{
        type: Number,
        required: true
    },
    label:{
        type: String,
        required: true
    },
    x:{
        type: Number,
        required: true
    },
    y:{
        type: Number,
        required: true
    },
    width:{
        type: Number,
        required: true
    },
    height:{
        type: Number,
        required: true
    }
    
})

module.exports = mongoose.model('Annotations', annotationsSchema)