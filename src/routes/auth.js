
const express = require('express')
const bcrypt = require('bcrypt')
const validator = require('validator')
const { validateSignUpData } = require('../utils/validation')
const User = require('../models/user');
const router = express.Router()

router.post('/signup', async (req, res) => {
    console.log('req', req.body)

    try {
        //Validate data
        validateSignUpData(req)
        const { firstName, lastName, emailId, password } = req.body
        //Encrypt password
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashPassword
        })  //It creates a new instance of user modal.
        let result = await user.save() // returns a promise and saves the newly created instance in the database.
        const token = await result.getJwt()
        res.cookie("token",token)
        res.json({message: 'User Signed up successfully.', data: result})
    }
    catch (err) {
        res.status(400).send('Error occured while signing up : ' + err)
    }
})

router.post('/login', async (req, res) => {
    const { emailId, password } = req.body
    try {
        if (!validator.isEmail(emailId)) throw new Error('Please enter valid Email Id')

        const userData = await User.findOne({ emailId: emailId })

        if (!userData) throw new Error('Invalid Credentials!')

        const isPasswordMatched = await userData.validatePassword(password)

        if (!isPasswordMatched) {
            throw new Error('Invalid Credentials!')
        }
        else {
           const token = await userData.getJwt()

           res.cookie("token",token)
           res.send(userData)
        }
    }
    catch (err) {
        res.status(400).send('Error : ' + err.message)
    }
})

router.post('/logout', async(req, res)=>{
    res.cookie('token', null ,{
        expires: new Date(Date.now())
    })
    res.send('Logout successfull!')
})

module.exports = router;