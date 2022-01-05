const express = require('express')
const { read } = require('fs')
const { append } = require('vary')
const router = express.Router()
const Image = require('../models/images')

//Getting all images
router.get('/', async(req, res) => {
    try{
        const images = await Image.find()
        res.json(images)
    } catch(err){
        res.status(500).json({ message: err.message })
    }
})

//Getting info
router.get('/:id', getImage, (req, res) => {
    res.json(res.image)
})

//Creating images 
router.post('/', async(req, res) => {
    const image = new Image({
        user_id:req.body.user_id,
        image_id:req.body.image_id, 
        path:req.body.path,
        is_annotated:req.body.is_annotated
    
    })
    try {
        const newImage= await image.save()
        res.status(201).json(newImage)
        //res.redirect('/images')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})