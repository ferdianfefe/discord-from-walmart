const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Botname
const botName = 'ChatCord Bot'

//run when client connect
io.on('connection', socket => {
    //Join a chatroom
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to chatcord'))

        //Broadcast when a user connect
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        //When client is disconnect
        socket.on('disconnect', () => {
            const user = userLeave(socket.id)

            if (user) {
                io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
            }

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })

        })
    })

    //Listen for chatMessage event
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
})
const port = process.env.PORT || 3001
server.listen(port, () => console.log(`server running on http://localhost:${port}`))