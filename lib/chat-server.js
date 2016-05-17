var socketio = require('socket.io');
var connection = require('../db.js');
var io;
var async = require('async');


// maps socket.id to user's nickname
var nicknames = {};
// list of socket ids

var clients = [];
var namesUsed = [];
var isAdmin = [];
// maps socket.id to user's nickname
var nicknamesAdmin = {};
// list of socket ids

var clientsAdmin = [];
var namesUsedAdmin = [];
var adminArr = {}


exports.listen = function(server) {
    console.log('Hello!!!');
    io = socketio.listen(server);
    io.set('log level', 2); //debugging level 2 for info
    io.sockets.on('connection', function(socket) {
        initializeConnection(socket);
        handleChoosingNicknames(socket);
        handleClientDisconnections(socket);
        // handleMessageBroadcasting(socket);
        handlePrivateMessaging(socket);
    });
}

function initializeConnection(socket) {
    showActiveUsers(socket);
    // showActiveAdmin(socket);

}

function showActiveUsers(socket) {
    console.log("==============>>", adminArr[socket.id]);
    if (adminArr[socket.id] != 1) {
        showOldMsgs(socket);
        var activeNames = [];
        var usersInRoom = io.sockets.clients();
        // console.log('userInRoom',usersInRoom);
        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId !== socket.id && nicknames[userSocketId]) {
                var name = nicknames[userSocketId];
                activeNames.push({
                    id: namesUsed.indexOf(name),
                    nick: name ,
                    is_admin : 0
                });
            }
        }
        console.log('active names');
        socket.emit('names', activeNames); //send active user to frontend
    } else

    {

        // showOldMsgs(socket);
        var activeNames = [];
        var usersInRoom = io.sockets.clients();
        // console.log('userInRoom',usersInRoom);
        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId !== socket.id && nicknamesAdmin[userSocketId]) {
                var adminName = nicknamesAdmin[userSocketId];
                activeNames.push({
                    id: namesUsed.indexOf(adminName),
                    nick: adminName ,
                    is_admin :1
                });
            }
        }
        console.log('active names');
        socket.emit('names', activeNames); //send active user to frontend


    }


}

/*function showActiveAdmin(socket) {
    // showOldMsgs(socket);
    var activeNames = [];
    var usersInRoom = io.sockets.clients();
    // console.log('userInRoom',usersInRoom);
    for (var index in usersInRoom) {
        var userSocketId = usersInRoom[index].id;
        if (userSocketId !== socket.id && nicknamesAdmin[userSocketId]) {
            var adminName = nicknamesAdmin[userSocketId];
            activeNames.push({
                id: namesUsed.indexOf(adminName),
                nick: adminName
            });
        }
    }
    console.log('active names');
    socket.emit('namesAdmin', activeNames); //send active user to frontend
}*/
//implement via db..
function showOldMsgs(socket) {


    console.log('-----old-----db----');
    socket.on('old-db', function(userToPM) {
        var from = nicknames[socket.id];
        var to = userTOPM;
        q = ' select * from chat where from_email = ? and to_email = ? order by id desc  ';
        connection.query(q, [from, to], function(err, result) {
            if (err)
            // cb(err);
                console.log('err-----', err);

            else {
                console.log('result---', result);
                // cb(null, result);
                io.socket.emit('load old msgs', {
                    result: result
                });
            }
        });
    });
}

//nickname
/*function handleChoosingNicknames(socket) {
    socket.on('choose nickname', function(nick, is_admin, cb) {
        if (namesUsed.indexOf(nick) !== -1) {
            cb('That name is already taken!  Please choose another one.');
            return;
        }
        var ind = namesUsed.push(nick) - 1;
        console.log('ind', ind);
        clients[ind] = socket;
        nicknames[socket.id] = nick;
        console.log(JSON.stringify(nicknames));
        cb(null);
        io.sockets.emit('new user', {
            id: ind,
            nick: nick,
            is_admin: is_admin
        });
    });
}*/
//nickname
function handleChoosingNicknames(socket) {


    socket.on('choose nickname', function(nick, is_admin, cb) {
        if (is_admin == 1) {
            console.log('in admin==============')
            if (namesUsedAdmin.indexOf(nick) !== -1) {
                cb('That name is already taken!  Please choose another one.');
                return;
            }
            var ind = namesUsedAdmin.push(nick) - 1;
            console.log('ind', ind);
            clientsAdmin[ind] = socket;
            nicknamesAdmin[socket.id] = nick;
            adminArr[socket.id] = is_admin;
            console.log('adminArr===>>', adminArr);
            console.log(JSON.stringify(nicknamesAdmin));
            cb(null);
            io.sockets.emit('new user', {
                id: ind,
                nick: nick,
                is_admin: 1
            });
        } else {
            console.log('not in admin==============')

            if (namesUsed.indexOf(nick) !== -1) {
                cb('That name is already taken!  Please choose another one.');
                return;
            }
            var ind = namesUsed.push(nick) - 1;
            console.log('ind', ind);
            clients[ind] = socket;
            nicknames[socket.id] = nick;
            adminArr[socket.id] = is_admin;
            console.log('adminArr===>>', adminArr);
            console.log(JSON.stringify(nicknames));
            cb(null);
            io.sockets.emit('new user', {
                id: ind,
                nick: nick,
                is_admin: 0
            });

        }


    });
}

function handlePrivateMessaging(socket) {
    socket.on('private message', function(data) {
        var from = nicknames[socket.id];
        // console.log("user to pm",JSON.stringify(nicknames));
        // var nick = nicknames[socket.id];
        // console.log('nick is is',namesUsed[data.userToPM]);

        async.waterfall([

            function(cb) {
                var to = namesUsed[data.userToPM];

                q = ' select * from chat where (from_email = ? and to_email = ?)  or (from_email = ? and to_email = ?) order by id desc  ';
                connection.query(q, [from, to, to, from], function(err, result) {
                    if (err)
                        cb(err);
                    else {
                        // console.log('result---', result);
                        cb(null, result);
                    }
                })


            },
            function(result1, cb) {
                q = 'insert into chat(from_email , to_email , msg , time) values(?,?,?,?)'

                var to = namesUsed[data.userToPM];
                var msg = data.msg;
                console.log('date', Date());
                connection.query(q, [from, to, msg, Date()], function(err, result) {
                    if (err)
                        cb(err);
                    else
                        cb(null, result1);


                });
            }
        ], function(err, result) {
            if (err)
                console.log('err----', err);
            // console.log('result------------------',result);
            clients[data.userToPM].emit('private message', {
                from: from,
                msg: data.msg,
                result: result
            });
        });

    });
}

function handleClientDisconnections(socket) {
    socket.on('disconnect', function() {
        var ind = namesUsed.indexOf(nicknames[socket.id]);
        delete namesUsed[ind];
        delete clients[ind];
        delete nicknames[socket.id];
        io.sockets.emit('user disconnect', ind);
    });
}