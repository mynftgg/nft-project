

<template>
    <App :player="player" :flappy="flappy" :isMobile="isMobile" :image = "image" @gameOver="handleGameOver"></App>
</template>

<script>
import Flappy, { Player, Block } from 'wasd-flappy'
import App from './app.vue'

const isMobile = /mobile/i.test(navigator.userAgent)

var canvas = {
  height: 384,
  width: 288,
  floorHeight: 55,
  fps: 50
}

// var canvas = {
//   height: 1000,
//   width: 1000,
//   floorHeight: 55,
//   fps: 50
// }

// 创建角色
var player = new Player({
  height: 26,
  width: 36,
  startX: 50,
  velocity: 10,
  pop: 10,
  reverse: true
})

// 创建敌人，随机位置、高度随机生成
var block = new Block({
  name: 'tube',
  width: 52,
  padding: 100,
  height: [120, 180]
})

// 创建 flappy 游戏
var flappy = new Flappy({
  canvas,
  player,
  levels: [
    {
      score: 0,
      blocks: [block],
      blockDistance: [100, 200]
    }
  ]
})

!isMobile && document.addEventListener('keydown', e => {
  // console.log("NO MOBILE");
  // console.log(player)
  // space, up, w
  if (e.keyCode === 32 || e.keyCode === 38 || e.keyCode === 87) {
    if (flappy.state === 'READY') {
      flappy.start()
    } else if (flappy.state === 'OVER') {
      flappy.restart()
      return
    }
    player.jump()
  }
})

isMobile && document.addEventListener('click', e => {
  // console.log("IS MOBILE");
  // console.log(player)
  // space, up, w
  // if (e.keyCode === 32 || e.keyCode === 38 || e.keyCode === 87) {
    if (flappy.state === 'READY') {
      flappy.start()
    } else if (flappy.state === 'OVER') {
      flappy.restart()
      return
    }
    player.jump()
  // }
})


export default {
    name: "flappy",
      inject: ['rpgEngine', 'rpgKeypress', 'rpgGuiClose', 'rpgGui', 'rpgSocket', 'rpgCurrentPlayer'],
      props: ['image', 'nftId'],
    setup() {
      return {
        flappy,
        isMobile,
        canvas
      }
    },
    components: {
        App
    },
    data() {
      return {
        player,
        rpgPlayer: {},
      }
    },
    methods: {
      handleGameOver(data){
          this.rpgSocket().emit('gamePoints', {
              player: this.rpgPlayer.name,
              nftId: this.nftId,
              game: "flappy",
              score: data.score,
          }) 
      },
      birdImage() {
        return this.image
      }
    },
    mounted() {
      this.obsCurrentPlayer = this.rpgCurrentPlayer.subscribe(({ object }) => {
        this.rpgPlayer = object;
      })

      this.obsKeyPress = this.rpgKeypress.subscribe(({ inputName, control }) => {
        if (control && control.actionName == 'back') {
          this.rpgGuiClose('flappy')
          this.rpgSocket().emit("gameClosed")
        }
      })
    },
    unmounted() {
      this.obsCurrentPlayer.unsubscribe()
      this.obsKeyPress.unsubscribe()
    }
}
</script>
