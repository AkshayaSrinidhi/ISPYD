const express = require('express')
const { read } = require('fs')
const { append } = require('vary')
const router = express.Router()
const Annotation = require('../models/annotation')

//Getting all annotations
router.get('/', async(req, res) => {
    try{
        const annotations = await Annotation.find()
        res.json(annotations)
    } catch(err){
        res.status(500).json({ message: err.message })
    }
})

//Getting one annotation
router.get('/:id', getAnnotation, (req, res) => {
    res.json(res.annotation)
})

//Creating an annotation
router.post('/', async(req, res) => {
    const annotation = new Annotation({
        user_id:req.body.user_id,
        image_id:req.body.image_id, 
        label: req.body.label,
        x: req.body.x,
        y: req.body.y,
        width: req.body.width,
        height: req.body.height
    })
    try {
        const newAnnotation = await annotation.save()
        res.status(201).json(newAnnotation)
        //res.redirect('/annotations')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})