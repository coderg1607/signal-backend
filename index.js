const express = require('express');
const socketio=require('socket.io')(http,{cors:{origin:"*"});
const http=require('http');
const {addUser,removeUser,getUser,getUserInRoom} = require('./users.js');
const cor=require('cors');

const PORT = process.env.PORT || 5000;

const app=express();

const router= require('./router');
app.use(router);
app.use(cor())
const server=http.createServer(app);

const io= socketio(server);
io.on('connection',(socket)=>{
    socket.on('join',({name,room},callback)=>{
        const {error ,user } =addUser({id:socket.id,name,room});

        if(error)
        return callback(error);

        socket.emit('message',{user:'admin', text : `${user.name},Welcome to the my whatsapp ${user.room} group`})
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined group chat!`})
        socket.join(user.room);
        io.to(user.room).emit('roomData',{room:user.room , users:getUserInRoom(user.room)})
        callback();
    })
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit('message',{user:user.name , text : message});
        io.to(user.room).emit('roomData',{room:user.room , users:getUserInRoom(user.room)});
        callback();
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);

        if(user)
        {
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left the room!`})
        }
    })
})
server.listen(PORT,()=> console.log(`server started on ${PORT}`))
