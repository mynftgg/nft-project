import { RpgEvent, EventData, RpgPlayer, Move } from '@rpgjs/server'

var escrowDemo = false;

export function nftEvent(
    name: string,
    graphic: string,
    text: string | string[],
    moveRandom?: boolean,
    frequency?: number,
    speed?: number
): any {
    @EventData({
        name,
        graphic,
        hitbox: {
            width: 32,
            height: 16
        },
        width: 65,
        height: 65,
    })
    class NftEvent extends RpgEvent {
        onInit() {
            this.speed = speed || 1
            this.frequency = frequency || 200
            this.setGraphic(graphic)
            if (moveRandom) this.infiniteMoveRoute([ Move.tileRandom() ])
        }
        async onAction(player: RpgPlayer) {
            if (escrowDemo) {
                var choice: any;
                choice = await player.showChoices('Do you want to buy this NFT?', [
                    { text: 'Trade my Thug#0797', value: 'Yes' },
                    { text: 'Purchase for 1 SOL', value: 'No' },
               ])
            } else {
                player.gui('custom-dialog').open({
                    message: text,
                    typewriterEffect: true,
                    fullWidth: true
                });
            }
        }
    }
    return NftEvent
}