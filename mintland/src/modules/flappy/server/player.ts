import { RpgPlayer, RpgPlayerHooks } from '@rpgjs/server'

export const player: RpgPlayerHooks = {
    async onConnected(player: RpgPlayer) {
        player.on("openFlappy", function (data) {
            player.gui('flappy').open({ image: data.originalImage, nftId: data._id })
            player.data.inGame = true
        });
    }
}