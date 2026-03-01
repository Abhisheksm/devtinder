const express = require('express')
require('./config/database')
const connectDB = require('./config/database');
const app = express();
const cookieParser = require('cookie-parser')
const cors = require('cors')

const allowedOrigins = [
  'http://localhost:5173',
  'https://devtinderweb-1.netlify.app'
]


const corsOptions = {
  origin(origin, callback) {
    // allow non-browser clients (like Postman) that may not send origin
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Let cors package reflect requested headers from preflight automatically.
  // Hardcoding this list can break PATCH when frontend sends additional headers.
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

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

