<template>
  <div ref="wrapper" class="wrapper">
    <div class="container">
      <div class="top-bar">
        <div class="doodle-title">
          <h2>NFT Jump</h2>
          <div class="close-btn" @click="close">X</div>
        </div>
        <p>
          High Score: {{ highScore }}.
        </p>
        <p>To move, use arrow keys on your computer.</p>
        <p>Or tap the left or right side of screen on your mobile phone.</p>
      </div>
      <div class="game-container" id="game-container">
        <canvas id="canvas"> Aww, your browser doesn't support HTML5! </canvas>

        <div id="mainMenu">
          <h1>NFT jump</h1>
          <h3>Press esc or back arrow to exit</h3>
          <!-- <h3>using HTML5,</h3>
          <h3>...by <a href="http://twitter.com/solitarydesigns/" target="_blank">Kushagra Agarwal</a></h3>
          <h3>and <a href="http://twitter.com/_rishabhp" target="_blank">Rishabh</a></h3> -->

          <p class="info">
            use
            <span class="key left">←</span>
            <span class="key right">→</span>
            to move and space to (re) start...
          </p>
          <!-- <a class="button" href="javascript:init()">Play</a> -->
          <a class="button" v-on:click="init()">Play</a>

          <!-- <a class="button" v-on:click="left()">Left</a>
          <a class="button" v-on:click="right()">Right</a> -->
        </div>

        <div id="gameOverMenu">
          <h1>game over!</h1>
          <h3 id="go_score">you scored 0 points</h3>
          <h3>Press esc or back arrow to exit</h3>

          <a class="button" v-on:click="reset()">Restart</a>
          <!-- <a id="tweetBtn" target="_blank" class="button tweet" href="#">Tweet score</a>

          <a id="fbBtn" target="_blank" class="button fb" href="#">Post on FB</a> -->
        </div>

        <!-- Preloading image ;) -->
        <img id="sprite" src="./doodle_sprite_nft.png" />
        <img id="nftsprite" src="./doodle_sprite_nft.png" />
        <!-- <img id="sprite" src="http://i.imgur.com/2WEhF.png"/> -->

        <div id="scoreBoard">
          <p id="score">{{ score }}</p>
        </div>

        <!-- <button id = "leftButton"> Left </button> -->
      </div>
    </div>
  </div>
</template>

<script>
var sprite_image = require("./doodle_sprite_nft.png");
import { Control } from '@rpgjs/client'

export default {
  name: "doodlejump",
  props: ["image", "nftId"],
  inject: [
    "rpgEngine",
    "rpgKeypress",
    "rpgGuiClose",
    "rpgGui",
    "rpgSocket",
    "rpgCurrentPlayer",
  ],
  components: {},
  data() {
    return {
      highScore: 0,
      score: 0
    }
  },
  unmounted() {
    this.obsCurrentPlayer.unsubscribe()
    this.obsKeyPress.unsubscribe()
    document.onkeydown = undefined;
    document.onkeyup = undefined;
    document.ontouchstart = undefined;
    document.ontouchend = undefined;
  },
  mounted() {
    var self = this;

    var sprite = document.getElementById("sprite");
    // sprite.src = sprite_image;
    //  sprite.setAttribute('src', sprite_image)

    sprite.src = sprite_image;
    sprite.setAttribute("src", sprite_image);

    nftsprite.src = this.image;
    nftsprite.setAttribute("src", this.image);

    this.obsCurrentPlayer = this.rpgCurrentPlayer.subscribe(({ object }) => {
      this.player = object;
    });

    this.obsKeyPress = this.rpgKeypress.subscribe(({ inputName, control }) => {
      if (control && control.actionName == 'back') {
        this.rpgGuiClose('doodlejump')
        this.rpgSocket().emit("gameClosed")
      }
    })

    // RequestAnimFrame: a browser API for getting smooth animations
    window.requestAnimFrame = (function () {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        }
      );
    })();

    var canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d");

    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;

    //Variables for game
    var platforms = [],
      image = document.getElementById("sprite"),
      player,
      platformCount = 10,
      position = 0,
      gravity = 0.2,
      animloop,
      flag = 0,
      menuloop,
      broken = 0,
      dir,
      score = 0,
      firstRun = true;

    //Base object
    var Base = function () {
      this.height = 5;
      this.width = width;

      //Sprite clipping
      this.cx = 0;
      this.cy = 614;
      this.cwidth = 100;
      this.cheight = 5;

      this.moved = 0;

      this.x = 0;
      this.y = height - this.height;

      this.draw = function () {
        try {
          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };
    };

    var base = new Base();

    //Player object
    var Player = function () {
      this.vy = 11;
      this.vx = 0;

      this.isMovingLeft = false;
      this.isMovingRight = false;
      this.isDead = false;

      this.width = 55;
      this.height = 40;

      // EDIT HERE TO CHANGE NFT IMAGE

      //Sprite clipping
      this.cx = 0;
      this.cy = 0;
      this.cwidth = 110;
      this.cheight = 80;

      this.dir = "left";

      this.x = width / 2 - this.width / 2;
      this.y = height;

      //Function to draw it
      this.draw = function () {
        try {
          if (this.dir == "right") this.cy = 121;
          else if (this.dir == "left") this.cy = 201;
          else if (this.dir == "right_land") this.cy = 289;
          else if (this.dir == "left_land") this.cy = 371;

          var nftImage = document.getElementById("nftsprite");
          ctx.drawImage(nftImage, this.x, this.y, 48, 48);
          // ctx.drawImage(nftImage, this.cx, this.cy, 52, 56, this.x, this.y, 52, 56);
          // ctx.drawImage(nftImage, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
        } catch (e) {}
      };

      this.jump = function () {
        this.vy = -8;
      };

      this.jumpHigh = function () {
        this.vy = -16;
      };
    };

    player = new Player();

    //Platform class

    function Platform() {
      this.width = 70;
      this.height = 17;

      this.x = Math.random() * (width - this.width);
      this.y = position;

      position += height / platformCount;

      this.flag = 0;
      this.state = 0;

      //Sprite clipping
      this.cx = 0;
      this.cy = 0;
      this.cwidth = 105;
      this.cheight = 31;

      //Function to draw it
      this.draw = function () {
        try {
          if (this.type == 1) this.cy = 0;
          else if (this.type == 2) this.cy = 61;
          else if (this.type == 3 && this.flag === 0) this.cy = 31;
          else if (this.type == 3 && this.flag == 1) this.cy = 1000;
          else if (this.type == 4 && this.state === 0) this.cy = 90;
          else if (this.type == 4 && this.state == 1) this.cy = 1000;

          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };

      //Platform types
      //1: Normal
      //2: Moving
      //3: Breakable (Go through)
      //4: Vanishable
      //Setting the probability of which type of platforms should be shown at what score
      if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
      else if (score >= 2000 && score < 5000)
        this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
      else if (score >= 1000 && score < 2000)
        this.types = [2, 2, 2, 3, 3, 3, 3, 3];
      else if (score >= 500 && score < 1000)
        this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
      else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
      else this.types = [1];

      this.type = this.types[Math.floor(Math.random() * this.types.length)];

      //We can't have two consecutive breakable platforms otherwise it will be impossible to reach another platform sometimes!
      if (this.type == 3 && broken < 1) {
        broken++;
      } else if (this.type == 3 && broken >= 1) {
        this.type = 1;
        broken = 0;
      }

      this.moved = 0;
      this.vx = 1;
    }

    for (var i = 0; i < platformCount; i++) {
      platforms.push(new Platform());
    }

    //Broken platform object
    var Platform_broken_substitute = function () {
      this.height = 30;
      this.width = 70;

      this.x = 0;
      this.y = 0;

      //Sprite clipping
      this.cx = 0;
      this.cy = 554;
      this.cwidth = 105;
      this.cheight = 60;

      this.appearance = false;

      this.draw = function () {
        try {
          if (this.appearance === true)
            ctx.drawImage(
              image,
              this.cx,
              this.cy,
              this.cwidth,
              this.cheight,
              this.x,
              this.y,
              this.width,
              this.height
            );
          else return;
        } catch (e) {}
      };
    };

    var platform_broken_substitute = new Platform_broken_substitute();

    //Spring Class
    var spring = function () {
      this.x = 0;
      this.y = 0;

      this.width = 26;
      this.height = 30;

      //Sprite clipping
      this.cx = 0;
      this.cy = 0;
      this.cwidth = 45;
      this.cheight = 53;

      this.state = 0;

      this.draw = function () {
        try {
          if (this.state === 0) this.cy = 445;
          else if (this.state == 1) this.cy = 501;

          ctx.drawImage(
            image,
            this.cx,
            this.cy,
            this.cwidth,
            this.cheight,
            this.x,
            this.y,
            this.width,
            this.height
          );
        } catch (e) {}
      };
    };

    var Spring = new spring();

    function init() {
      //Variables for the game
      var dir = "left",
        jumpCount = 0;

      firstRun = false;

      //Function for clearing canvas in each consecutive frame

      function paintCanvas() {
        ctx.clearRect(0, 0, width, height);
      }

      //Adding keyboard controls
      document.onkeydown = function (e) {
        var key = e.keyCode;

        if (key == 37) {
          dir = "left";
          player.isMovingLeft = true;
        } else if (key == 39) {
          dir = "right";
          player.isMovingRight = true;
        }

        if (key == 32) {
          if (firstRun === true) {
            init();
            firstRun = false;
          } else reset();
        }
      };

      document.ontouchstart = function (e) {
        var containerElement = document.getElementById("game-container"); //.getBoundingClientRect()
        e.offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft;
        let center = containerElement.offsetWidth / 2;
        console.log("offset: " + e.offsetX);
        console.log("centr: " + center);
        if (e.offsetX > center) {
          console.log("clicked right");
          dir = "right";
          player.isMovingRight = true;
        } else {
          console.log("clicked left");
          dir = "left";
          player.isMovingLeft = true;
        }
      };

      document.ontouchend = function (e) {
        // console.log("touchend")
        player.isMovingLeft = false;
        player.isMovingRight = false;
        // e.offsetX = e.changedTouches[0].pageX - e.changedTouches[0].target.offsetLeft;
      };

      document.onkeyup = function (e) {
        var key = e.keyCode;

        if (key == 37) {
          dir = "left";
          player.isMovingLeft = false;
        } else if (key == 39) {
          dir = "right";
          player.isMovingRight = false;
        }
      };

      //Player related calculations and functions

      function playerCalc() {
        if (dir == "left") {
          player.dir = "left";
          if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
        } else if (dir == "right") {
          player.dir = "right";
          if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
        }

        //Accelerations produces when the user hold the keys
        if (player.isMovingLeft === true) {
          player.x += player.vx;
          player.vx -= 0.15;
        } else {
          player.x += player.vx;
          if (player.vx < 0) player.vx += 0.1;
        }

        if (player.isMovingRight === true) {
          player.x += player.vx;
          player.vx += 0.15;
        } else {
          player.x += player.vx;
          if (player.vx > 0) player.vx -= 0.1;
        }

        // Speed limits!
        if (player.vx > 8) player.vx = 8;
        else if (player.vx < -8) player.vx = -8;

        //console.log(player.vx);

        //Jump the player when it hits the base
        if (player.y + player.height > base.y && base.y < height) player.jump();

        //Gameover if it hits the bottom
        if (
          base.y > height &&
          player.y + player.height > height &&
          player.isDead != "lol"
        )
          player.isDead = true;

        //Make the player move through walls
        if (player.x > width) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = width;

        //Movement of player affected by gravity
        if (player.y >= height / 2 - player.height / 2) {
          player.y += player.vy;
          player.vy += gravity;
        }

        //When the player reaches half height, move the platforms to create the illusion of scrolling and recreate the platforms that are out of viewport...
        else {
          platforms.forEach(function (p, i) {
            if (player.vy < 0) {
              p.y -= player.vy;
            }

            if (p.y > height) {
              platforms[i] = new Platform();
              platforms[i].y = p.y - height;
            }
          });

          base.y -= player.vy;
          player.vy += gravity;

          if (player.vy >= 0) {
            player.y += player.vy;
            player.vy += gravity;
          }

          score++;
        }

        //Make the player jump when it collides with platforms
        collides();

        if (player.isDead === true) gameOver();
      }

      //Spring algorithms

      function springCalc() {
        var s = Spring;
        var p = platforms[0];

        if (p.type == 1 || p.type == 2) {
          s.x = p.x + p.width / 2 - s.width / 2;
          s.y = p.y - p.height - 10;

          if (s.y > height / 1.1) s.state = 0;

          s.draw();
        } else {
          s.x = 0 - s.width;
          s.y = 0 - s.height;
        }
      }

      //Platform's horizontal movement (and falling) algo

      function platformCalc() {
        var subs = platform_broken_substitute;

        platforms.forEach(function (p, i) {
          if (p.type == 2) {
            if (p.x < 0 || p.x + p.width > width) p.vx *= -1;

            p.x += p.vx;
          }

          if (p.flag == 1 && subs.appearance === false && jumpCount === 0) {
            subs.x = p.x;
            subs.y = p.y;
            subs.appearance = true;

            jumpCount++;
          }

          p.draw();
        });

        if (subs.appearance === true) {
          subs.draw();
          subs.y += 8;
        }

        if (subs.y > height) subs.appearance = false;
      }

      function collides() {
        //Platforms
        platforms.forEach(function (p, i) {
          if (
            player.vy > 0 &&
            p.state === 0 &&
            player.x + 15 < p.x + p.width &&
            player.x + player.width - 15 > p.x &&
            player.y + player.height > p.y &&
            player.y + player.height < p.y + p.height
          ) {
            if (p.type == 3 && p.flag === 0) {
              p.flag = 1;
              jumpCount = 0;
              return;
            } else if (p.type == 4 && p.state === 0) {
              player.jump();
              p.state = 1;
            } else if (p.flag == 1) return;
            else {
              player.jump();
            }
          }
        });

        //Springs
        var s = Spring;
        if (
          player.vy > 0 &&
          s.state === 0 &&
          player.x + 15 < s.x + s.width &&
          player.x + player.width - 15 > s.x &&
          player.y + player.height > s.y &&
          player.y + player.height < s.y + s.height
        ) {
          s.state = 1;
          player.jumpHigh();
        }
      }

      function updateScore() {
        var scoreText = document.getElementById("score");
        scoreText.innerHTML = score;
      }

      function gameOver() {
        platforms.forEach(function (p, i) {
          p.y -= 12;
        });

        self.highScore = Math.max(score, self.highScore)

        if (player.y > height / 2 && flag === 0) {
          player.y -= 8;
          player.vy = 0;
        } else if (player.y < height / 2) flag = 1;
        else if (player.y + player.height > height) {
          showGoMenu();
          hideScore();
          player.isDead = "lol";

          // ADD HERE
          console.log("EMITTING DOODLE POINTS");

          self.rpgSocket().emit("gamePoints", {
            player: self.player.name,
            nftId: self.nftId,
            game: "doodlejump",
            score: score,
          });

          // var tweet = document.getElementById("tweetBtn");
          // tweet.href='http://twitter.com/share?url=http://is.gd/PnFFzu&text=I just scored ' +score+ ' points in the HTML5 Doodle Jump game!&count=horiztonal&via=cssdeck&related=solitarydesigns';

          // var facebook = document.getElementById("fbBtn");
          // facebook.href='http://facebook.com/sharer.php?s=100&p[url]=http://cssdeck.com/labs/html5-doodle-jump/8&p[title]=I just scored ' +score+ ' points in the HTML5 Doodle Jump game!&p[summary]=Can you beat me in this awesome recreation of Doodle Jump created in HTML5?';
        }
      }

      //Function to update everything

      function update() {
        paintCanvas();
        platformCalc();

        springCalc();

        playerCalc();
        player.draw();

        base.draw();

        updateScore();
      }

      menuLoop = function () {
        return;
      };
      animloop = function () {
        update();
        requestAnimFrame(animloop);
      };

      animloop();

      hideMenu();
      showScore();
    }

    function reset() {
      hideGoMenu();
      showScore();
      player.isDead = false;

      flag = 0;
      position = 0;
      score = 0;

      base = new Base();
      player = new Player();
      Spring = new spring();
      platform_broken_substitute = new Platform_broken_substitute();

      platforms = [];
      for (var i = 0; i < platformCount; i++) {
        platforms.push(new Platform());
      }
    }

    this.init = init;
    this.reset = reset;

    //Hides the menu
    function hideMenu() {
      var menu = document.getElementById("mainMenu");
      menu.style.zIndex = -1;
    }

    //Shows the game over menu
    function showGoMenu() {
      var menu = document.getElementById("gameOverMenu");
      menu.style.zIndex = 1;
      menu.style.visibility = "visible";

      var scoreText = document.getElementById("go_score");
      scoreText.innerHTML = "You scored " + score + " points!";
    }

    //Hides the game over menu
    function hideGoMenu() {
      var menu = document.getElementById("gameOverMenu");
      menu.style.zIndex = -1;
      menu.style.visibility = "hidden";
    }

    //Show ScoreBoard
    function showScore() {
      var menu = document.getElementById("scoreBoard");
      menu.style.zIndex = 1;
    }

    //Hide ScoreBoard
    function hideScore() {
      var menu = document.getElementById("scoreBoard");
      menu.style.zIndex = -1;
    }

    function playerJump() {
      player.y += player.vy;
      player.vy += gravity;

      if (
        player.vy > 0 &&
        player.x + 15 < 260 &&
        player.x + player.width - 15 > 155 &&
        player.y + player.height > 475 &&
        player.y + player.height < 500
      )
        player.jump();

      if (dir == "left") {
        player.dir = "left";
        if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
      } else if (dir == "right") {
        player.dir = "right";
        if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
      }


      //Accelerations produces when the user hold the keys
      if (player.isMovingLeft === true) {
        player.x += player.vx;
        player.vx -= 0.15;
      } else {
        player.x += player.vx;
        if (player.vx < 0) player.vx += 0.1;
      }

      if (player.isMovingRight === true) {
        player.x += player.vx;
        player.vx += 0.15;
      } else {
        player.x += player.vx;
        if (player.vx > 0) player.vx -= 0.1;
      }

      //Jump the player when it hits the base
      if (player.y + player.height > base.y && base.y < height) player.jump();

      //Make the player move through walls
      if (player.x > width) player.x = 0 - player.width;
      else if (player.x < 0 - player.width) player.x = width;

      player.draw();
    }

    function update() {
      ctx.clearRect(0, 0, width, height);
      playerJump();
    }

    var menuLoop = function () {
      update();
      requestAnimFrame(menuLoop);
    };

    menuLoop();
  },
  methods: {
    close() {
      this.rpgEngine.controls.applyControl(Control.Back)
    }
  }
};
</script>

<style scoped lang="scss">
  @import url(http://fonts.googleapis.com/css?family=Gloria+Hallelujah);

  .wrapper {
    margin: 0;
    padding: 0;
    font-family: "Gloria Hallelujah", cursive;
  }

  .game-container {
    max-height: 552px;
    max-width: 422px;
    height: 100vh;
    width: 100vw;
    position: relative;
    margin: 0;
    overflow: hidden;
  }

  canvas {
    height: 100%;
    width: 100%;
    display: block;
    background: url(http://i.imgur.com/Y0BMP.png) top left;
  }

  #scoreBoard {
    width: 100%;
    position: absolute;
    top: 0;
    z-index: -1;
    padding: 10px 12px;
    background: rgba(182, 200, 220, 0.7);
    border-image: url(http://i.imgur.com/5BBsR.png) 100 5 round;
    border-bottom: 4px solid;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }

  #scoreBoard p {
    font-size: 20px;
    padding: 0;
    margin: 0;
  }

  img {
    display: none;
  }

  #mainMenu,
  #gameOverMenu {
    height: 100%;
    width: 100%;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }

  #gameOverMenu {
    visibility: hidden;
  }

  h2,
  h3,
  h1 {
    font-weight: normal;
  }
  h1 {
    font-size: 60px;
    color: #5a5816;
    transform: rotate(-10deg);
    margin: 0px;
  }

  h3 {
    text-align: right;
    margin: -10px 20px 0 0;
    color: #5e96be;
  }
  h3 a {
    color: #5a5816;
  }

  .button {
    width: 105px;
    height: 31px;
    background: url(http://i.imgur.com/2WEhF.png) 0 0 no-repeat;
    display: block;
    color: #000;
    font-size: 12px;
    line-height: 31px;
    text-decoration: none;
    position: absolute;
    left: 50%;
    bottom: 50px;
    margin-left: -53px;
    cursor: pointer;
    user-select: none;
  }

  .button.tweet {
    bottom: 100px;
    background-position: 0 -90px;
  }
  .button.fb {
    bottom: 150px;
    background-position: 0 -60px;
  }

  .info {
    position: absolute;
    right: 20px;
    bottom: 00px;
    margin: 0;
    color: green;
  }

  .info .key {
    width: 16px;
    height: 16px;
    background: url(http://i.imgur.com/2WEhF.png) no-repeat;
    text-indent: -9999px;
    display: inline-block;
  }

  .info .key.left {
    background-position: -92px -621px;
  }
  .info .key.right {
    background-position: -92px -641px;
  }

  .top-bar {
    background-color: #413e65;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
    z-index: 1;
    display: flex;
    flex-direction: column;
    color: white;
    padding: 20px 12px;

    .doodle-title {
      display: flex;

      h2 {
        font-family: 'Press Start 2P';
        font-size: 12px;
        margin: 0;
        margin-bottom: 10px;
        flex-grow: 1;
      }
    }

    p {
      margin: 0;
      font-family: 'Inconsolata';
    }
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
  }

  .container {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    max-width: 422px;
    padding: 0;
  }

  .close-btn {
    font-family: 'Press Start 2P';
    cursor: pointer;
    user-select: none;
  }
</style>