const sgMail = require('@sendgrid/mail')

const sgMailApiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sgMailApiKey)

const sendWelcomeMessage = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mfelfel95@gmail.com',
        subject: 'Welcome Mail',
        text: `Welcome to our website Mr.${name}`
    })
}

const userCancelation = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mfelfel95@gmail.com',
        subject: 'Cancelation Email',
        text: `Let us Know why did you cancel your account Mr. ${name}`
    })
}

module.exports = {
    userCancelation,
    sendWelcomeMessage
}