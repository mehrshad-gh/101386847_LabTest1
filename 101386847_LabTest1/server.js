const app = require('express')()
const http = require('http').createServer(app)
const cors = require('cors')
const req = require('express/lib/request')
const res = require('express/lib/response')
const { Socket } = require('socket.io')
const PORT = 3000
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')


// import models
const User = require('./models/User.js')
const PrivateMessage = require('./models/PrivateMessage')
const GroupMessage = require('./models/GroupMessage')

const io = require('socket.io')(http)

app.use(cors())
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cookieParser())


// default, login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/pages/login.html')
})

app.post('/login', async(req, res) => {
    if(req.body.username == '' || req.body.password == '') {
        console.log('username or password empty')
    }else {
        const user = await User.findOne({username: req.body.username})
        console.log(user)
        if(user != null) {
            if(user.password == req.body.password) {
                res.cookie('username', user.username)
                res.writeHead(301,
                    {Location: `http://localhost:3000/chat`}
                  );
                  res.end();
            }
        }
    }
    res.writeHead(301,
        {Location: 'http://localhost:3000/login'}
        );
        res.end();
})

app.get('/logout', (req, res) => {
    res.clearCookie('username')
    res.writeHead(301,
        {Location: 'http://localhost:3000/login'}
        );
        res.end();
    
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/pages/register.html')
})

app.post('/register', async (req, res) =>{
    const takenUsername = await User.findOne({username: req.body.username})
    if(takenUsername) {
        console.log('username taken')
    } else {
        const dbUser = new User({
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname
        })
        try{
            const user = await dbUser.save()
            console.log('user created')
            res.writeHead(301,
                {Location: '/login'}
              );
              res.end();
        }
        catch(err){
            console.log(err)
        }
    }
    res.writeHead(301,
        {Location: '/register'}
      );
      res.end();
})

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/pages/chat.html')
})

// socket io stuff

// client requests
io.on('connection', (socket) => {
    console.log('connection created...')

    // welcome message
    const welcomeMessage = {
        username: 'Server',
        message: 'Welcome to the chat application'
    }
    socket.emit('welcome', welcomeMessage)

    // join room
    socket.on('join', (roomName) => {
        console.log(`user joined ${roomName}`)
        socket.join(roomName)
    })

    // send message to room
    socket.on('messageRoom', (data) => {
        const message = {
            username: data.username,
            message: data.message
        }
        console.log(`${data.username} sent a message to ${data.room}`)
        // add messag to db
        const dbGroupMessage = new GroupMessage({
            from_user: data.username,
            room: data.room,
            message: data.message
        })
        dbGroupMessage.save()
        console.log(data.room)
        socket.to(data.room).emit('newMessage', message)
    })

    // user is typing
    socket.on('typing', (data)=> {
        socket.to(data.roomName).emit('typing', {username: data.username})
    })

    // disconnect
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected...`)
    })

})


//const dbURI = process.env.MONGO_DB;
const dbURI = "mongodb+srv://jack:txFTSmfRQMBx3aHl@comp3123.eyf58.mongodb.net/comp3133-labtest1?retryWrites=true&w=majority"

// connect to database
mongoose
  .connect(dbURI)
  .then(() => console.log(`Database connection successful`))
  .catch((err) => console.log(`Database connection error ${err}`));

//Start HTTP server
http.listen(PORT, () => {
    console.log(`Server running at PORT ${PORT}`)
})

