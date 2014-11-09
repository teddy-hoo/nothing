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

$("#data").attr('placeholder', 'send message as ' + name);

var socket = io.connect('/');

socket.on('connect', function() {
  socket.emit('adduser', name);
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
  $('#conversation').append('<b>'+ escaped(username) + ':</b> ' + escaped(data) + "<br/>");
});

// listener, whenever the server emits 'updateusers', this updates the username list
socket.on('updateusers', function(data) {
  $('#users').empty();
  $.each(data, function(key, value) {
    $('#users').append('<div><a href="' + searchUrlFor(key) + '" target="_blank">' +
                       key + '</div>');
  });
});

socket.on('servernotification', function (data) {
  var searchUrl = searchUrlFor(data.username);
  if(data.connected) {
    if(data.to_self) data.username = "you";

    $('#conversation').append('connected: <a href="' + searchUrl + '" target="_blank">' +
                              escaped(data.username) + "</a><br/>");
  } else {
    $('#conversation').append('disconnected: <a href="' + searchUrl + '" target="_blank">' +
                              escaped(data.username) + "</a><br/>");
  }
});

// on load of page
$(function(){
  // when the client hits ENTER on their keyboard
  $('#data').keypress(function(e) {
    if(e.which == 13) {
      var message = $('#data').val();
      $('#data').val('');
      // tell server to execute 'sendchat' and send along one parameter
      socket.emit('sendchat', message);
    }
  });
});
