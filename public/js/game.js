var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var player;
var score;

const width = 1350;
const height = 854;

function preload() {
  this.load.image(
    "ninja",
    "assets/128x128/Front - Walking/Front - Walking_000.png"
  );
  this.load.image(
    "otherPlayer",
    "assets//128x128/Front - Walking/Front - Walking_000.png"
  );
  this.load.image("farm", "assets/farm.png");
  this.load.image("cave", "assets/cave3.jpg");
  this.load.image("casino", "assets/casino.png");
  this.load.image("village", "assets/village.png");
}

function create() {
  var self = this;
  this.socket = io();

  //World Creation
  //Each image will be 1350 pixels wide, and 854 pixels long
  //   var width = 1024;
  //   var length = 786;
  //   var farm = this.add.image(0, 0, "farm").setOrigin(0);
  //   farm.displayWidth = width;
  //   farm.scaleY = farm.scaleX;
  //   var cave = this.add.image(1024, 0, "cave").setOrigin(0);
  //   cave.displayWidth = width;
  //   cave.scaleY = cave.scaleX;
  //   var village = this.add.image(0, 1024, "village").setOrigin(0);
  //   village.displayWidth = width;
  //   village.scaleY = village.scaleX;
  //   var casino = this.add.image(1024, 1024, "casino").setOrigin(0);
  //   casino.displayWidth = width;
  //   casino.scaleY = casino.scaleX;

  var farm = {
    key: "farm",
    x: 0,
    y: 0,
    scale: { x: 1.319648, y: 1.449915}
  };
  this.make.image(farm).setOrigin(0);
  var cave = {
    key: "cave",
    x: width,
    y: 0,
    scale: { y: 0.9415656}
  };
  this.make.image(cave).setOrigin(0);
  var village = {
    key: "village",
    x: 0,
    y: height,
    scale: {x: 1.928571, y: 2.135}
  };
  this.make.image(village).setOrigin(0);
  var casino = {
    key: "casino",
    x: width,
    y: height,
    scale: { x: 2.7, y: 2.359116}
  };
  this.make.image(casino).setOrigin(0);
  this.physics.world.setBounds(0, 0, width * 2, height * 2);

  //Camera set up
  this.cameras.main.setBounds(0, 0, width * 2, height * 2);

  this.otherPlayers = this.physics.add.group();
  this.socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on("newPlayer", function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on("disconnect", function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  this.socket.on("playerMoved", function(playerInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  //Score text
  text = this.add.text(32, 32).setScrollFactor(0).setFontSize(64).setColor('#000000');
}

function update() {
  if (this.ninja) {
    this.cameras.main.startFollow(player);
    text.setText([
        'X: ' + player.x,
        'Y: ' + player.y
    ]);
    if (this.cursors.left.isDown) {
      this.ninja.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.ninja.setVelocityX(150);
    } else if (this.cursors.up.isDown) {
      this.ninja.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.ninja.setVelocityY(150);
    } else {
      this.ninja.setVelocityY(0);
    }

    this.physics.world.wrap(this.ninja, 5);

    // emit player movement
    var x = this.ninja.x;
    var y = this.ninja.y;
    if (
      this.ninja.oldPosition &&
      (x !== this.ninja.oldPosition.x || y !== this.ninja.oldPosition.y)
    ) {
      this.socket.emit("playerMovement", {
        x: this.ninja.x,
        y: this.ninja.y
      });
    }

    // save old position data
    this.ninja.oldPosition = {
      x: this.ninja.x,
      y: this.ninja.y
    };
  }
}

function addPlayer(self, playerInfo) {
  self.ninja = self.physics.add
    .image(playerInfo.x, playerInfo.y, "ninja")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);
  player = self.ninja;
  self.ninja.setDrag(1000);
  self.ninja.setAngularDrag(100);
  self.ninja.setMaxVelocity(200);
  self.ninja.setTint(0xffd700);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, "otherPlayer")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
