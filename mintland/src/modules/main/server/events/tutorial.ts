import { RpgEvent, EventData, RpgPlayer } from '@rpgjs/server'
import { startNpcBattle } from '../../../battle/server/player';

const MSG = `
Welcome to MyNFT.gg! Here are some of the things you can do in our game.
Press esc (or the menu button on the top right) to access the menu & play mini-games.
To battle another trainer, go up to them and press Enter or the A button.
To learn more about each NFT, go up to it & press ENTER or A.
Would you like to try a demo battle with me?
`

export function tutorialEvent(nfts: object[]) {
    @EventData({
        name: 'tutorial-event'
    })
    class TutorialEvent extends RpgEvent {
        onInit(player: RpgPlayer) {
            this.setGraphic("male17")
        }

        async onAction(player: RpgPlayer) {
            const choice = await player.showChoices(MSG, [
                { text: "Yes", value: true },
                { text: "No", value: false }
            ]);

            if (choice && choice.value) {
                startNpcBattle(player, nfts)
            }
        }
    }
    return TutorialEvent
}
