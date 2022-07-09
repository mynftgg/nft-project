import { RpgPlayer, RpgPlayerHooks } from '@rpgjs/server'

export function setTrainerGraphic(player: RpgPlayer, idx: number) {
    player.data.activeTrainerIdx = idx
    const graphic = `hero_${player.data.trainers[idx].edition}`

    player.setGraphic(graphic)
    player.showAnimation(graphic, "stand", true)
}

export const player: RpgPlayerHooks = {
    onConnected(player: RpgPlayer) {
        player.on("addToParty", function(data) {
            const nft = player.data.nfts.filter(x => x._id == data._id)[0]
            player.data.party = [...player.data.party, nft]
        });

        player.on("removeFromParty", function(data) {
            player.data.party = player.data.party.filter(x => x._id != data._id)
        });

        player.on("setPartyLeader", function(data) {
            const nft = player.data.nfts.filter(x => x._id == data._id)[0]
            const others = player.data.party.filter(x => x._id != data._id)
            player.data.party = [nft, ...others]
        })

        player.on("setTrainer", function(data) {
            setTrainerGraphic(player, data.activeTrainerIdx)
        })
    },
    async onInput(player: RpgPlayer, data) {
        if (data.input == 'back') {
            player.gui('main-menu').open(
                {
                    nfts: player.data.nfts,
                    party: player.data.party,
                    trainers: player.data.trainers,
                    activeTrainerIdx: player.data.activeTrainerIdx
                }
            );
            player.gui('flappy').close();
            player.gui('doodlejump').close();
        }
    },
}