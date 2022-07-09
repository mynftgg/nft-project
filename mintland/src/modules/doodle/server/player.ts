import { RpgPlayer, RpgPlayerHooks } from '@rpgjs/server'
import { getRandomEntry } from '../../../utils/utils';

export const player: RpgPlayerHooks = {
    async onConnected(player: RpgPlayer) {
        player.on("openDoodle", function (data) {
            player.gui('doodlejump').open({ image: data.originalImage, nftId: data._id })
            player.data.inGame = true
        });
    }
}