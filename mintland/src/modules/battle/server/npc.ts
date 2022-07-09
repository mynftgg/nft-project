import { clone, getRandomEntry } from "../../../utils/utils"

export class NpcPlayer {
    data: any
    name: string

    constructor(nfts) {
        this.name = "Tutorial Bot"

        this.data = {
            party: [clone(getRandomEntry(nfts))]
        }
    }

    emit(name, data) {
        this.handleMessage(name, data)
    }

    handleMessage(name: string, data: any) {
        switch (name) {
            case "battle__reset":
                this._sendRandomAttack()
                break
            default:
                break
        }
    }

    _sendRandomAttack() {
        const nft = this.data.party[0]
        const availableAttacks = Object.values(nft.attacks).filter((x: any) => x.mp <= nft.mp)
        let attackName: string

        if (availableAttacks.length > 0) {
            const attack = getRandomEntry(availableAttacks)
            attackName = attack.name
        } else {
            attackName = "struggle"
        }

        this.data.battleManager.addMove({
            player: this.data.battlePlayerType,
            type: "attack",
            name: attackName
        })
    }
}
