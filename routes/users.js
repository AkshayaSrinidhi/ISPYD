const express = require('express')
const { read } = require('fs')
const { append } = require('vary')
const router = express.Router()
const User = require('../models/users')

//Getting all users
router.get('/', async(req, res) => {
    try{
        const users = await User.find()
        res.json(users)
    } catch(err){
        res.status(500).json({ message: err.message })
    }
})

//Getting one user
router.get('/:id', getUser, (req, res) => {
    res.json(res.users)
})

//Creating a user
router.post('/', async(req, res) => {
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
router.patch('/:id', getUser, async (req, res) => {
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

//Deleting an annotation
router.delete('/:id', getUser, async (req, res) => {
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

module.exports = router