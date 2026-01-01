const express = require('express')
require('./config/database')
const connectDB = require('./config/database');
const app = express();
const cookieParser = require('cookie-parser')
const cors = require('cors')

app.use(cors({
    //To solve cors issue
    //origin: 'http://localhost:5173', 
    origin: 'https://devtinderweb-1.netlify.app',
    //backend configuration to send cookies
    credentials: true}))
/*
express.json() is the middleware used to parse the JSON which is coming from req body to Javascript object.
*/
app.use(express.json())
app.use(cookieParser())

const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')

app.use('/', authRouter)
app.use('/',profileRouter)
app.use('/',requestRouter)
app.use('/', userRouter)

connectDB().then(() => {
    console.log('Database connected successfully')
    app.listen(8000, () => {
        console.log('Server is successfully listening on port 8000')
    })

}).catch(err => {
    console.log('err while connecting database', err)
})

