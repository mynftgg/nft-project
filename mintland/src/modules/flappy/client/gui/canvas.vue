<template>
  <canvas
    class="canvas"
    ref="canvas"
    v-bind="$props"
    :style="{ width: clientWidth }">
    <slot :ctx="ctx"></slot>
    <img id="nftsprite" src="" />
  </canvas>
</template>

<script>
  export default {
    name: 'canvas',
    props: {
      width: Number,
      height: Number,
      floorHeight: Number,
      score: Number,
      groundImage: {},
      bgImage: {},
      isMobile: Boolean,
      image: String,
    },
    data () {
      return {
        ctx: {},
        clientWidth: this.width
      }
    },
    created () {
      this.count = 0
      this.groundY = this.height - this.floorHeight
      if (this.isMobile) {
        this.clientWidth = '100vw'
      }
    },
    methods: {
      reset (score = 0) {
        const offset = ++this.count * 3 % 48
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.drawImage(this.bgImage, 0, 0)
        this.ctx.drawImage(this.groundImage,
          offset, 0,
          this.width, this.floorHeight,
          0, this.groundY,
          this.width, this.floorHeight)
        this.drawScore(score)
      },
      drawScore (score) {
        this.ctx.font = 'bold 14px verdana, sans-serif'
        this.ctx.fillStyle = '#fff'
        this.ctx.fillText(score, 10, 20)
      },
      drawBird(data, image) {
        var nftImage =  document.getElementById("nftsprite");
        const { startX, startY, width, height, offset } = data
        const cur = parseInt(++this.count / 10, 10) % 3 * width
        const angle = offset * 2 * Math.PI / 180
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const x = cosA * startX - sinA * startY
        const y = cosA * startY + sinA * startX - width / 2

        this.ctx.save()
        this.ctx.rotate(-angle)
        // this.ctx.drawImage(nftImage,
        //   cur, 0,
        //   width, height,
        //   x, y,
        //   width, height)

        this.ctx.drawImage(nftImage, x, y, 36, 36)
        this.ctx.restore()
      },
      drawTubes(tubes, image) {
        tubes.forEach(tube => this.drawTube(tube, image));
      },
      drawTube(data, image) {
        const { startX, startY, width, endY } = data

        this.ctx.save()
        // draw bottom
        this.ctx.drawImage(image,
          0, 0,
          width, endY,
          startX, endY,
          width, endY)

        // draw top
        this.ctx.scale(1, -1)
        this.ctx.drawImage(image,
          0, 0,
          width, startY,
          startX, -startY,
          width, startY)
        this.ctx.restore()
      }
    },
    mounted () {
      this.ctx = this.$refs.canvas.getContext('2d')
      console.log("PRINTING IMAGE")
      console.log(this.image)
          var nftImage =  document.getElementById("nftsprite");
            nftImage.src = this.image;
            nftImage.setAttribute('src', this.image)
    }
  }
</script>