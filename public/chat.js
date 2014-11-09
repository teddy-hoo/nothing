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

$("#attend").hide();

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
    $('#users').append('<div><a href="' + searchUrlFor(key) + '" target="_blank">' +
                       key + '</div>');
  });
  $("#player2").text(0);
});

socket.on('servernotification', function (data) {
  var searchUrl = searchUrlFor(data.username);
  if(data.connected) {
    if(data.to_self) data.username = "you";

    $('#conversation').append('connected: <a href="' + searchUrl + '" target="_blank">' +
                              escaped(data.username) + "</a><br/>");
    $("#player1").text(0);
  } else {
    $('#conversation').append('disconnected: <a href="' + searchUrl + '" target="_blank">' +
                              escaped(data.username) + "</a><br/>");
    $("#attend-content").text(data.username + " attended!");
    $("#attend").show();
    $("#player2").text(0);
  }
});

$(function(){
  $('.gun').click(function(e) {

    socket.emit('sendchat', 1);

  });
});
