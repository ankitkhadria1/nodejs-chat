 $(function() {
     var socket = io.connect();
     // id of user that is being private messaged
     var userToPM = undefined;

     $('#choose-nickname').ready(function() {

         var nick = $('#nickname').val();
         var admin = $('#admin').val();
         alert("got it" + admin);
         socket.emit('choose nickname', nick, admin, function(err) {
             if (err) {
                 $('#nick-error').text(err);
                 $('#nickname').val('');
             } else {
                 $('#nickname-container').hide();
                 $('#chat-container').show();
             }
         });
     });

     socket.on('names', function(users) {
         displayUsers(users);
     });
     socket.on('namesAdmin', function(users) {
         displayUsers1(users);
     });

     socket.on('new user', function(user) {

         displayUsers([user]);
     });

     function displayUsers(users) {

         var html = '';
         var html1 = '';
         for (var i = 0; i < users.length; i++) {
             if (users[i].is_admin) {
                 html += '<div class="user" id="user' + users[i].id + '">' + users[i].nick + '</div>';
             } else {
                             html1 += '<div class="admins" id="admin' + users[i].id + '">' + users[i].nick + '</div>';

             }

         }
         $('#users').append(html);

          $('#admin').append(html1);

         // ===========================
         // it should be random...======
         // -==========================
         $('.user').click(function(e) {
             if (!userToPM) {
                 $('#pm-col').show();
             }
             userToPM = $(this).attr('id').substring(4);
             $('#user-to-pm').html('<h2>' + $(this).text() + '</h2>');
         });
     }

     function displayUsers1(users) {

         var html = '';

         for (var i = 0; i < users.length; i++) {

             html += '<div class="admins" id="admin' + users[i].id + '">' + users[i].nick + '</div>';
         }
         $('#admin').append(html);

         // ===========================
         // it should be random...======
         // -==========================
         $('.user').click(function(e) {
             if (!userToPM) {
                 $('#pm-col').show();
             }
             userToPM = $(this).attr('id').substring(4);
             $('#user-to-pm').html('<h2>' + $(this).text() + '</h2>');
         });
     }
     socket.on('user disconnect', function(id) {
         console.log(id);
         $('#user' + id).remove();
     });

     $('#send-message').submit(function(e) {
         e.preventDefault();
         var msg = $('#new-message').val();
         socket.emit('message', msg);
         $('#new-message').val('');
     });

     socket.on('message', function(data) {
         displayMsg(data.msg, data.nick)
     });


     /*
    this function for load old db


 */

     $('.user').click(function(e) {
         e.preventDefault();
         socket.emit('old-db', userToPM);
         //old message displaying
         socket.on('load old msgs', function(docs) {
             for (var i = docs.length - 1; i >= 0; i--) {
                 displayMsg(docs[i].msg, docs[i].nick);
             }
         });

     })


     function displayMsg(msg, nick) {
         console.log(nick);
         document.getElementById('title').innerHTML = nick;
         var html = "<span class='msg'><strong>" + nick + ":</strong> " + msg + "</span>";
         $('#private-chat').append(html);
     }


     // end of load db
     // 
     // send private message
     $('#send-pm').submit(function(e) {
         e.preventDefault();
         console.log('usertopm', userToPM);
         socket.emit('private message', {
             msg: $('#new-pm').val(),
             userToPM: userToPM
         });
         $('#new-pm').val('');
     });

     socket.on('private message', function(data) {

         // console.log('data----',data);
         var html = '';
         // $('#pMsg').remove();
         // var history = data.result;
         // // console.log('history length------',history.length);
         // // console.log('history--------',history);
         // var html;
         // for(var i=0;i<history.length;i++)
         // {
         // 	 html += "<span class='pMsg'>"+history[i].from_email+'::'+history[i].msg+"</span>";
         // 	 html +="<br>";
         // }
         // // var html = "<span class='pMsg'>"+data.result+"</span>"
         html += "<span class='pMsg'><strong>" + data.from + ":</strong> " + data.msg + "</span>";
         $('#private-chat').append(html);

     });

     // end of private message

 });