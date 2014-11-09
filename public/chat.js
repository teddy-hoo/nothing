function getName() {
  var local = JSON.parse(window.localStorage.getItem("press"));
  var name = local && local.username ?
             local.username : prompt("Inter a name for this game:", "");
  window.localStorage.setItem("press", JSON.stringify({ username: name }));

  return name.trim();
}

function escaped(s) {
  return $("<div></div>").html(s).html();
}

function searchUrlFor(name) {
  return 'https://www.google.com/search?q=' + encodeURIComponent(name) +
         '%20site:wikipedia.org&btnI=3564';
}

var name = getName();

var socket = io.connect('/');

socket.on('connect', function() {
  socket.emit('adduser', name);
});

socket.on('updatechat', function (username, data) {
  if(username == name){
    $("#player1").text(parseInt($("#player1").text()) + 1);
  }
  else{
    $("#player2").text(parseInt($("#player2").text()) + 1);
  }
});

socket.on('updateusers', function(data) {
  $('#users').empty();
  $.each(data, function(key, value) {
    $('#users').append('<div>' + value + '</div>');
  });
  $("#player1").text(0);
  $("#player2").text(0);
});

socket.on('servernotification', function (data) {
  var searchUrl = searchUrlFor(data.username);
  if(data.connected) {
    if(!data.to_self){
      $("#attend-content").text(data.username + " attended!");
    }
  } else {
    $("#attend-content").text(data.username + " leaved!");
  }
});

$(function(){
  $('.gun').click(function(e) {

    socket.emit('sendchat', 1);

  });
});
