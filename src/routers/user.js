const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../db/models/user')
const auth = require('../middleware/auth')
const { userCancelation, sendWelcomeMessage } = require('../emails/account')
const router = express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // user.save()
    //     .then(() => res.status(201).send(user))
    //     .catch(error => res.status(400).send(error))
    try {
        await user.save()
        sendWelcomeMessage(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send()
    }
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter(token => req.token !== token.token)
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send('Unable to logout')
    }
})

router.post('/users/logoutAll',auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.get('/users/me',auth, async (req, res) => {
    // User.find({}).then(users => {
    //     res.send(users)
    // }).catch(err => {
    //     res.status(400).send(err)
    // })
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // } catch(err){
    //     res.status(400).send()
    // }
    res.send(req.user)

})


router.patch('/users/me', auth, async (req, res) => {
    // const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('Invalid Update')
    }

    try {
        // const user = await User.findById(_id)
        const user = req.user
        updates.forEach(update => user[update] = req.body[update])
        await user.save()
        
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
        // if(!user){
        //     return res.status(400).send('No User Found')
        // }
        res.send(user)
    } catch(err) {
        res.status(500).send(err)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(_id)
        // if(!user){
        //     return res.status(400).send('No User Found')
        // }
        await req.user.remove()
        userCancelation(req.user.email, req.user.name)
        res.send(req.user)
    } catch(e){
        res.status(500).send(e)
    }
})

const uploads = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Unsupported Format'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar' , auth, uploads.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('Done')
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Deleted')
})

router.get('/users/:id/avatar', async (req, res) => {
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
        throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)

})

module.exports = router