const mongoose = require('mongoose')

const imagesSchema = new mongoose.Schema({
    path:{
        type: String,
        required: true
    },
    is_annotated:{
        type: Boolean,
        required: true
    }
    
})

module.exports = mongoose.model('Images', imagesSchema)