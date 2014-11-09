var express = require('express');
var _ = require('underscore');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var nodes = { };
var userlist = {};
server.listen(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use('/public', express.static('public'));

app.get('/', function (req, res) {
  res.render('index');
});

userlist = {
  curUser: 0;
  users: []
};

io.sockets.on('connection', function(socket) {
  socket.on('sendchat', function (data) {
    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', function(username) {
    socket.username = username;

    userlist[username] = username;

    socket.emit('servernotification',
                { connected: true, to_self: true, username: username });

    socket.broadcast.emit('servernotification',
                          { connected: true, username: username });

    io.sockets.emit('updateusers', userlist);
  });

  socket.on('disconnect', function(){

    delete userlist[socket.username];

    io.sockets.emit('updateusers', userlist);

    socket.broadcast.emit('servernotification',
                          { username: socket.username });
  });
});
