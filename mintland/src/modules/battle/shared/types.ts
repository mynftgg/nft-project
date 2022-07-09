class Move {
    type: string
    player: "p1" | "p2"
}

class Attack extends Move {
    type = "attack"
    name: string

    constructor(name: string) {
        super()
        this.name = name
    }
}

class Swap extends Move {
    type = "swap"
    id: string

    constructor(id: string) {
        super()
        this.id = id
    }
}

class BattleData {
    rpgPlayer: any // RpgPlayer
    pokemon: any
    party: any
}
