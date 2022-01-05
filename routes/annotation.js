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

//Updating an annotation
router.patch('/:id', getAnnotation, async (req, res) => {
    if(req.body.label != null) {
        res.annotation.label = req.body.label
    }
    if(req.body.x != null) {
        res.annotation.x = req.body.x
    }
    if(req.body.y != null) {
        res.annotation.y = req.body.y
    }
    if(req.body.width != null) {
        res.annotation.width = req.body.width
    }
    if(req.body.height != null) {
        res.annotation.height = req.body.height
    }

    try {
        const updatedAnnotation = await res.annotation.save()
        res.json(updatedAnnotation)
    } catch(err) {
        res.status(400).json({ message: err.message })
    }

})

//Deleting an annotation
router.delete('/:id', getAnnotation, async (req, res) => {
    try {
        await res.annotation.remove()
        res.json({ message: 'Deleted Annotation'})
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
})

async function getAnnotation(req, res, next){
    let annotation
    try {
        annotation = await Annotation.findById(req.params.id)
        if (annotation == null) {
            return res.status(404).json( { message: 'Cannot find subscriber' })
        }
    } catch(err) {
        return res.status(500).json( { message: err.message })
    }
    res.annotation = annotation
    next()
}

module.exports = router