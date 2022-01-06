const express = require('express')
const { read } = require('fs')
const { append } = require('vary')
const router = express.Router()
const Image = require('../models/images')
const Annotation = require('../models/annotation')
const User = require('../models/users')

//Getting all users
router.get('/users/', async(req, res) => {
    try{
        const users = await User.find()
        res.json(users)
    } catch(err){
        res.status(500).json({ message: err.message })
    }
})

//Getting one user
router.get('/users/:id', getUser, (req, res) => {
    res.json(res.users)
})

//Creating a user
router.post('/users/', async(req, res) => {
    const user = new User({
        user_name: req.body.user_name,
        email: req.body.email,
        password: req.body.password
    })
    try {
        const newUser = await users.save()
        res.status(201).json(newUser)
        //res.redirect('/annotations')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Updating a user
router.patch('/users/:id', getUser, async (req, res) => {
    if(req.body.password != null) {
        res.annotation.label = req.body.password
    }
    try {
        const updatedUser = await res.users.save()
        res.json(updatedUser)
    } catch(err) {
        res.status(400).json({ message: err.message })
    }

})

//Deleting a user
router.delete('/users/:id', getUser, async (req, res) => {
    try {
        await res.users.remove()
        res.json({ message: 'Deleted User'})
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
})

async function getUser(req, res, next){
    let user
    try {
        user = await User.findById(req.params.id)
        if (user == null) {
            return res.status(404).json( { message: 'Cannot find User' })
        }
    } catch(err) {
        return res.status(500).json( { message: err.message })
    }
    res.user = user
    next()
}

//Getting all annotations
router.get('/annotations/', async(req, res) => {
    try{
        const annotations = await Annotation.find()
        res.json(annotations)
    } catch(err){
        res.status(500).json({ message: err.message })
    }
})

//Getting one annotation
router.get('/annotations/:id', getAnnotation, (req, res) => {
    res.json(res.annotation)
})

//Creating an annotation
router.post('/annotations/', async(req, res) => {
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
router.patch('/annotations/:id', getAnnotation, async (req, res) => {
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
router.delete('/annotations/:id', getAnnotation, async (req, res) => {
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

//Getting all images
router.get('/images/', async(req, res) => {
    try{
        const images = await Image.find()
        res.json(images)
    } catch(err){
        res.status(500).json({ message: err.message })
    }
})

//Getting info
router.get('/images/:id', getImage, (req, res) => {
    res.json(res.image)
})

//Creating images 
router.post('/images/', async(req, res) => {
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