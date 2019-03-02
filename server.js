var express = require("express");
var app = express();
var path = require("path");
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

var players = {};
var coins = {};
//Amount of coins to spawn
var coinAmount = 30;

app.use(express.static(__dirname + "/public"));

//Add coins to the coin object
for(var i = 0; i < coinAmount; i++){
  coins[i] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    coinId: i
  }
}

io.on("connection", function(socket) {
  console.log("a user connected");
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id
  };
  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // send coins object to new player
  socket.emit("coinLocations", coins);

  socket.on("disconnect", function() {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});

server.listen(8000);
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});
