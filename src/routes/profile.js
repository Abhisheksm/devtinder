const express = require('express')

const {userAuth} = require('../middlewares/middleware')
const {validateEditProfileData} = require('../utils/validation')
const bcrypt = require('bcrypt')
const router = express.Router()
const validator = require('validator')

router.get('/api/profile/view', userAuth, async (req, res)=>{
    try{
            const user = req.user
            res.send(user)
    }
    catch(err){
        res.status(400).send('Error : ' + err.message)
    }
})

router.patch('/api/profile/edit', userAuth, async(req, res)=>{
    try{
       if(!validateEditProfileData(req))
       {
        throw new Error('Invalid Edit Request!')
       }
       
       const user = req.user

       Object.keys(req.body).forEach(key => (user[key]= req.body[key]))

       await user.save()

       res.json({message: "User Data updated successfully!",
        data: user
       })
    }
    catch(err){
        res.status(400).send('Error : ' + err.message)
    }
})

router.patch('/api/profile/changePassword', userAuth, async(req, res)=>{

    try{
        const {currentPassword, newPassword} = req.body
        if(!validator.isStrongPassword(newPassword)){
            throw new Error('Please enter strong password!')
        }
        if(currentPassword === newPassword){
            throw new Error('New password cannot be same as exisitng password!')
        }
        const user = req.user
        const hashedPassword = user.password
        const isPasswordMatched = await bcrypt.compare(currentPassword, hashedPassword)
        if(!isPasswordMatched) {
            throw new Error('Entered current password is not correct.')
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = newHashedPassword
        await user.save()
        res.send('Password Updated Successfully!')
    }
    catch(err){
        res.status(400).send('Error : ' + err.message)
    }
   


})

module.exports = router