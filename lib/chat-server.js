var _redis = require("redis");

var redis = _redis.createClient();


var socketio = require('socket.io');

var io;

//redis connection check
redis.on("error", function(err) {
  console.log('error occur' + err);
});
// maps socket.id to user's nickname
var nicknames = {};
// list of socket ids
var clients = []; 
var namesUsed = [];

exports.listen = function(server){
  io = socketio.listen(server);
  io.set('log level', 2);
  io.sockets.on('connection', function(socket){
    initializeConnection(socket);
    handleChoosingNicknames(socket);
    handleClientDisconnections(socket);
    handleMessageBroadcasting(socket);
    handlePrivateMessaging(socket);
  });
}

function initializeConnection(socket){
  showActiveUsers(socket);
  showOldMsgs(socket);
}

function showActiveUsers(socket){
  var activeNames = [];
  var usersInRoom = io.sockets.clients();
  for (var index in usersInRoom){
    var userSocketId = usersInRoom[index].id;
    if (userSocketId !== socket.id && nicknames[userSocketId]){
      var name = nicknames[userSocketId];
      activeNames.push({id: namesUsed.indexOf(name), nick: name});
    }
  }
  socket.emit('names', activeNames);
}

// //implement via redis..
// function showOldMsgs(socket){
  
//   // console.log('socket id',socket.id);
//   // console.log('nicc',nicknames[socket.id]);
// //   redis.keys('*', function (err, keys) {
// //   if (err) return console.log(err);

// //   for(var i = 0, len = keys.length; i < len; i++) {
// //     redis.lrange(keys[i], 0, -1,function(error,result)
// //       {
// //         if(error) console.log('err'+error);
// //         else
// //           console.log('result'+result);
// //       });
// //   }
// // }); 
  
// }

//nickname
function handleChoosingNicknames(socket){
  socket.on('choose nickname', function(nick, cb) {
    if (namesUsed.indexOf(nick) !== -1) {
      cb('That name is already taken!  Please choose another one.');
      return;
    }
    var ind = namesUsed.push(nick) - 1;
    console.log('ind',ind);
    clients[ind] = socket;
    nicknames[socket.id] = nick;
    console.log(JSON.stringify(nicknames));
    cb(null);
    io.sockets.emit('new user', {id: ind, nick: nick});
  });
}


//save to redis
function handleMessageBroadcasting(socket){
  socket.on('message', function(msg){
    var nick = nicknames[socket.id];
    console.log('nick is',nick);
    
  
    var data = {nick: nick, msg: msg , time: Date()};

    redis.rpush("userChat" , JSON.stringify(data));
   


  });
}

function handlePrivateMessaging(socket){
  socket.on('private message', function(data){
    var from = nicknames[socket.id];
    // console.log("user to pm",JSON.stringify(nicknames));
      // var nick = nicknames[socket.id];
    // console.log('nick is is',namesUsed[data.userToPM]);
   
    clients[data.userToPM].emit('private message', {from: from, msg: data.msg});
      var data = {from: from, to:namesUsed[data.userToPM] , msg: data.msg , time: Date()};
      // console.log('data',JSON.stringify(data));
    redis.rpush("userChat1" , JSON.stringify(data));
  });
}

function handleClientDisconnections(socket){
  socket.on('disconnect', function(){
    var ind = namesUsed.indexOf(nicknames[socket.id]);
    delete namesUsed[ind];
    delete clients[ind];
    delete nicknames[socket.id];
    io.sockets.emit('user disconnect', ind);
  });
}