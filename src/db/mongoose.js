const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then((response) => {
    console.log('Connected Successfully.')
}).catch((error) => {
    console.log(error)
})

