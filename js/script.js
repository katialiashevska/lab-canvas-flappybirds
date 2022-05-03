window.onload = function() {
    document.getElementById("start-button").onclick = function() {
    document.getElementById("title").style.display = 'none';
    document.getElementById("game-board").style.display = 'block';
    startGame();
  };
  function startGame() {
    myGameArea.start();
    background = new Background('images/bg.png');
    player = new Component(64, 40, "images/flappy.png", 100, 110);
    myGameArea.myObstacles = [];
  }
  var myGameArea = {
    canvas: document.getElementById("my-canvas"),
    myObstacles: [],
    frames: 0,
    gravity: 0.10,
    drawCanvas: function() {
      this.canvas.width = 400;
      this.canvas.height = 510;
      this.context = this.canvas.getContext("2d");
      document.getElementById("game-board").append(this.canvas);
    },
    start: function() {
      this.drawCanvas();
      this.reqAnimation = window.requestAnimationFrame(updateGameArea);
    },
    clear: function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    score: function() {
      points = (Math.floor(this.frames / 5));
      this.context.font = '38px serif';
      this.context.fillStyle = 'white';
      this.context.fillText(points, 20, 50);
    },
    stop: function() {
      cancelAnimationFrame(this.reqAnimation);
      this.gameOver();
    },
    gameOver: function() {
      this.clear();
      this.drawFinalPoints();
      this.restartGame();
    },
    drawFinalPoints: function() {
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.font = '38px serif';
      this.context.fillStyle = 'red';
      this.context.fillText('Game Over!', 20, 240);
      this.context.fillStyle = 'white';
      this.context.fillText('Final score: ' + points, 20, 290);
    },
    restartGame: function(){
      setTimeout(function () {
        document.getElementById("game-board").style.display = 'none';
        document.getElementById("title").style.display = 'block';
      }, 1500);
    }
  };
  // draw the background infinite image
  function Background(source) {
    this.img = new Image();
    this.img.src = source;
    this.scale = 1.05;
    this.y = 0;
    this.dx = 0.5;
    this.imgW = this.img.width;
    this.imgH = this.img.height;
    this.x = 0;
    this.clearX = 0;
    this.clearY = 0;
    that = this;
    this.img.onload = function() {
      that.imgW = that.img.width * that.scale;
      that.imgH = that.img.height * that.scale;
      if (that.imgW > myGameArea.canvas.width) { that.x = myGameArea.canvas.width - that.imgW; }
      if (that.imgW > myGameArea.canvas.width) { that.clearX = that.imgW; } else { that.clearX = myGameArea.canvas.width; }
      if (that.imgH > myGameArea.canvas.height) { that.clearY = that.imgH; } else { that.clearY = myGameArea.canvas.height; }
    };
    this.draw = function() {
      ctx = myGameArea.context;
      if (that.imgW <= myGameArea.canvas.width) {
        if (that.x > myGameArea.canvas.width) { that.x = -that.imgW + that.x; }
        if (that.x > 0) { ctx.drawImage(that.img, -that.imgW + that.x, that.y, that.imgW, that.imgH); }
        if (that.x - that.imgW > 0) { ctx.drawImage(that.img, -that.imgW * 2 + that.x, that.y, that.imgW, that.imgH); }
      } else {
        if (that.x > (myGameArea.canvas.width)) { that.x = myGameArea.canvas.width - that.imgW; }
        if (that.x > (myGameArea.canvas.width - that.imgW)) { ctx.drawImage(that.img, that.x - that.imgW + 1, that.y, that.imgW, that.imgH); }
      }
      ctx.drawImage(that.img, that.x, that.y, that.imgW, that.imgH);
      that.x += that.dx;
    };
  }
  function Component(width, height, image, x, y) {
    this.image = new Image();
    this.image.src = image;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.userPull = 0;
    this.update = function() { myGameArea.context.drawImage(this.image, this.x, this.y, this.width, this.height); };
    this.newPos = function() {
      this.x += this.speedX;
      player.speedY = player.speedY + (myGameArea.gravity - player.userPull);
      this.y += player.speedY;
    };
    this.left = function() { return this.x; };
    this.right = function() { return (this.x + this.width); };
    this.top = function() { return this.y; };
    this.bottom = function() { return this.y + (this.height); };
    this.crashWith = function(obstacle) {
      return  !((player.bottom() < obstacle.top()) ||
                (player.top() > obstacle.bottom()) ||
                (player.right() < obstacle.left()) ||
                (player.left() > obstacle.right()));
    };
    this.outOfCanvas = function(obstacle) { return ((player.bottom() > myGameArea.canvas.height) || (player.top() < 0)); };
  }
  function createObstacle() {
    x = myGameArea.canvas.width;
    y = myGameArea.canvas.height;
    height = Math.floor(Math.random() * (200 - 20 + 1) + 20);
    gap = Math.floor(Math.random() * (200 - 100 + 1) + 100);
    myGameArea.myObstacles.push(new Component(70, height, "images/obstacle_top.png", x, 0));
    myGameArea.myObstacles.push(new Component(70, (y - height - gap), "images/obstacle_bottom.png", x, height + gap));
  }
  function updateGameArea() {
    for(i=0; i < myGameArea.myObstacles.length; i++) {
        if (player.crashWith(myGameArea.myObstacles[i])) {
          myGameArea.stop();
          return;
        }
    }
    if (myGameArea.frames % 120 === 0) {
      createObstacle();
    }
    myGameArea.clear();
    background.draw();
    myGameArea.myObstacles.forEach(function(obstacle){
      obstacle.x += -3;
      obstacle.update();
    });
    myGameArea.frames += 1;
    player.newPos();
    player.update();
    myGameArea.score();
    if (player.outOfCanvas()) {
      myGameArea.stop();
      return;
    }
    myGameArea.reqAnimation = window.requestAnimationFrame(updateGameArea);
  }
  // Adding some power to our bird. Catching the user iteraction
  document.onkeydown = function(e) {
    if (e.keyCode == 32) { 
      player.userPull = 0.5; 
    }
  };
  document.onkeyup = function(e) {
    if (e.keyCode == 32) { 
      player.userPull = 0; 
    }
  };
};