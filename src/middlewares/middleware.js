const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userAuth = async ( req, res, next) =>{
    try{
        const { token } = req.cookies
        if(!token)
        {
            return res.status(401).send('UnAuthorised request, please login to continue')
        //   throw new Error('UnAuthorised request, please login to continue')
        }

        const decodedObj = await jwt.verify(token, 'Dev@Abhishek')
        const {_id} = decodedObj
        const userObj = await User.findById(_id)
        if(!userObj)
            {
                throw new Error('User Not found!')
            }
        req.user = userObj
        next()
    }
    catch(err){
        res.status(400).send('Error : ' + err.message)
    }
  
}

// const adminAuth = (req,res,next)=>{
//     console.log('Checking for adminAuth')
//     const token = 'abc'
//     const isAuthorized = token === 'abc'
//     if(!isAuthorized)
//     {
//         res.status(401).send('Admin is not Authorised')    }
//         else{
//             next()
//         }
// }

module.exports = {
    userAuth,
    // adminAuth
}
