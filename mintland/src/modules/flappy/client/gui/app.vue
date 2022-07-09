<template>
  <main class="app" :class="{ 'mobile': isMobile }">
    <div class="container" >
      <div class="top-bar">
        <div class="flappy-title">
          <h2>Flappy NFT</h2>
          <div class="close-btn" @click="close">X</div>
        </div>
        <div>
          <p>
            High Score: {{ highScore }}.
            To flap, press W on your computer or tap the screen on your mobile phone.
            <a class="restart-btn"
              @click="flappy.restart()"
              v-if="gameState === 'OVER'">Restart
            </a>
          </p>
        </div>
      </div>

      <f-canvas
        @touchstart.native="jump"
        :bg-image="images[0]"
        :ground-image="images[3]"
        ref="canvas"
        :score="score"
        :is-mobile="isMobile"
        v-bind="flappy._canvas"
        :image="image"
      />
    </div>
    <!-- <p>Powered by
      <a href="https://github.com/wasd-org/wasd-flappy">wasd-flappy</a>
    </p> -->
  </main>
</template>

<script>
  import FCanvas from './canvas.vue'
  import loadImage from 'image-promise'
  import { Control } from '@rpgjs/client'

  const imageLoadPromise = loadImage([
    require('./assets/bg.png'),
    require('./assets/bird.png'),
    require('./assets/tube.png'),
    require('./assets/ground.png'),
    // require("https://oc5epdw3tllfkvpt4ubfvvjldxidtvhk22b6rckeqlva2zgclfnq.arweave.net/cLpHjtua1lVV8-UCWtUrHdA51OrWg-iJRILqDWTCWVs")
  ])

  export default { // eslint-disable-line
    components: { FCanvas },
    props: ['flappy', 'player', 'isMobile', 'image'],
    inject: ['rpgEngine', 'rpgGuiClose', 'rpgGui', 'rpgStage'],
    data() {
      return {
        score: 0,
        highScore: 0,
        gameState: '',
        images: [],
      }
    },
    methods: {
      jump() {
        // for some reason, this.player is undefined here
        if (this.flappy.state === 'READY') {
          this.flappy.start()
        } else if (this.flappy.state === 'OVER') {
          this.flappy.restart()
          return
        }

        this.player.jump()
      }
    },
    mounted () {
      var self = this;

      imageLoadPromise.then(all => {
        const canvas = this.$refs.canvas
        this.images = all

        this.$nextTick(_ => canvas.reset())

        this.flappy.on(['game:progress', 'game:ready'], stats => {
          canvas.reset(stats.score)
          canvas.drawBird(stats.player, this.images[1])
          canvas.drawTubes(stats.blocks, this.images[2]);
          this.score = stats.score
          this.gameState = stats.state
        })

        this.flappy.on(['player:hitblock', 'player:hitfloor'], stats => {
          this.flappy.gameover()
          self.$emit('gameOver', { score: self.score });
          this.highScore = Math.max(this.score, this.highScore)
        })
      })
    },
    methods: {
      close() {
        this.rpgEngine.controls.applyControl(Control.Back)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .restart-btn {
    color: #42b983;
    cursor: pointer;
  }

  .app {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
  }

  .top-bar {
    background-color: #413e65;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
    z-index: 1;
    display: flex;
    flex-direction: column;
    color: white;
    padding: 20px 12px;

    .flappy-title {
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

  .close-btn {
    font-family: 'Press Start 2P';
    cursor: pointer;
    user-select: none;
  }

  .container {
    width: 288px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    padding: 0;
  }
</style>