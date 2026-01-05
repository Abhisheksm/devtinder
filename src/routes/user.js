const express = require('express')
const { userAuth } = require('../middlewares/middleware')
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')

const router = express.Router()

//Get all the pending connection requests of the logged in user.
router.get('/api/user/requests/received', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user

        const connectionRequests = await ConnectionRequest.find(
            { toUserId: loggedInUser._id, status: 'interested' }
        ).populate('fromUserId', ["firstName", "lastName", "photoUrl", "age", "about", "skills"])

        //.populate('fromUserId', 'firstName, lastName') 
        //we can also write like above code but jsut need to seperate list by space.

        res.json({ message: 'Data fetched successfully.', data: connectionRequests })
    }
    catch (err) {
        res.status(400).send("Error :" + err.message)
    }

})

//Get the connections of the logged in user.
router.get('/api/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user

        const connectionRequests = await ConnectionRequest.find(
            {
                $or: [
                    { toUserId: loggedInUser._id, status: 'accepted' },
                    { fromUserId: loggedInUser._id, status: 'accepted' }
                ]
            }
        ).populate('fromUserId', ["firstName", "lastName", "photoUrl", "age", "about", "skills"])
            .populate('toUserId', ["firstName", "lastName", "photoUrl", "age", "about", "skills"])

        const data = connectionRequests.map(data => {
            if (data.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return data.toUserId
            }
            return data.fromUserId
        }
        )

        res.json({ data })
    }
    catch (err) {
        res.status(400).send("Error :" + err.message)
    }
})

router.get('/api/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user
        const page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 50
        limit = limit > 50 ? 50 : limit
        const skip = (page - 1) * limit

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {
                    fromUserId: loggedInUser._id
                },
                {
                    toUserId: loggedInUser._id
                }
            ]
        }).select("fromUserId toUserId")

        const hideUsers = new Set()

        connectionRequests.forEach(user => {
            hideUsers.add(user.fromUserId)
            hideUsers.add(user.toUserId)
        })

        //Array.from() method creates an arrayt from Set.
        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsers) } },     //$nin: not in array
                { _id: { $ne: loggedInUser._id } }             //$ne: not equal
            ]
        }).select(["firstName", "lastName", "photoUrl", "age", "about", "skills"]).skip(skip).limit(limit)

        res.send(users)
    }
    catch (err) {
        res.status(400).send("Error :" + err.message)
    }
})


module.exports = router