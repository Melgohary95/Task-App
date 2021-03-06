const express = require('express')
const Task = require('../db/models/task')
const auth = require('../middleware/auth')
const router = express.Router()


router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    // task.save()
    //     .then(() => res.status(201).send(task))
    //     .catch(error => res.status(400).send(error))
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    }catch(err){
        res.status(400).send(err)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:asc

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    // Task.find({}).then(tasks => {
    //     res.send(tasks)
    // }).catch(err => {
    //     res.status(400).send(err)
    // })
    try{
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(err){
        res.status(400).send(err)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    // Task.findById(_id).then(task => {
    //     if(!task){
    //         return res.status(400).send('Invalid ID')
    //     }
    //     res.send(task)
    // }).catch(err => {
    //     res.status(500).send(err)
    // })
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task){
            return res.status(400).send('No Task found')
        }
        res.send(task)
    } catch(err) {
        res.status(500).send()
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('Invalid Operation')
    }
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id})
        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        if(!task) {
            return res.status(400).send('No Task Found')
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch(err) {
        res.status(500).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        // const task = await Task.findByIdAndDelete(_id)
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if(!task){
            return res.status(400).send('No Task Found')
        }
        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})



module.exports = router