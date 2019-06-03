const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

// app.use((req, res, next) => {
//     res.status(503).send('Server is currently Unavailable')
// })

// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb){
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             cb(new Error('Please Upload a word document'))
//         }

//         cb(undefined, true)
//     }
// })
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send('Done')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)




app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
