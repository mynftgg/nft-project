import { RpgPlayer } from "@rpgjs/server"
import { getRandomInt, sleep, waitForIo } from "../../../utils/utils";
import { NpcPlayer } from "./npc";
import Damage from '../shared/Damage.js';

class BattleData {
    rpgPlayer: Player
    pokemon: any
    party: any
    effects: any[]
}

type Player = RpgPlayer | NpcPlayer

export class BattleManager {
    p1: any
    p2: any

    turns: any[]
    turn_number: number

    finished: boolean;

    constructor(p1: Player, p2: Player) {
        this.p1 = this._initializePlayerData(p1)
        this.p2 = this._initializePlayerData(p2)
        this.turns = [{}] 
        this.turn_number = 0
        this.finished = false;
    }

    addMove(data) {
        const current_turn = this.turns[this.turn_number]

        if (current_turn[data.player]) {
            console.warn(`Already recorded move for player ${data.player} in turn ${this.turn_number}`)
            return;
        }

        current_turn[data.player] = data

        if (Object.values(current_turn).length == 2) {
            this._resolveTurn(current_turn)
        }
    }

    run(data) {
        const winner = this._getOtherPlayer(data)
        this._handleWinner(winner, true)
    }

    _initializePlayerData(player: Player): BattleData {
        const data = new BattleData()
        data.rpgPlayer = player
        data.party = player.data.party
        data.pokemon = data.party[0]
        this._resetHp(data.party)
        return data;
    }

    async _resolveTurn(turn) {
        const p1_move = turn["p1"]
        const p2_move = turn["p2"]

        const sorted_moves = [p1_move, p2_move].sort((a, b) => this._compareMoves(a, b))
        await sleep(500)

        for (var move of sorted_moves) {
            const runNext = await this._handleMove(move)

            if (!runNext) {
                break
            }
        }

        if (!this.finished) {
            this.turns.push({})
            this.turn_number += 1

            this.p1.rpgPlayer.emit("battle__reset")
            this.p2.rpgPlayer.emit("battle__reset")
        }
    }

    _compareMoves(a, b): number {
        if (a.type == "swap") {
            return -1
        } else if (b.type == "swap") {
            return 1
        } else if (a.type == "skip") {
            return 1
        } else if (b.type == "skip") {
            return -1
        } else if (a.type == "attack" && b.type == "attack") {
            return this._compareAttackSpeeds(a, b)
        }

        return 0;
    }

    _compareAttackSpeeds(a, b): number {
        const player_a = this._getActivePlayer(a)
        const player_b = this._getActivePlayer(b)

        if (player_a.pokemon.speed > player_b.pokemon.speed) {
            return -1
        } else if (player_a.pokemon.speed < player_b.pokemon.speed) {
            return 1
        } else {
            return getRandomInt(3) - 2
        }
    }

    _getActivePlayer(move) {
        return move.player == "p1" ? this.p1 : this.p2;
    }

    _getOtherPlayer(move) {
        return move.player == "p1" ? this.p2 : this.p1;
    }

    async _handleMove(move): Promise<boolean> {
        switch (move.type) {
            case "swap":
                return await this._handleSwap(move)
            case "attack":
                return await this._handleAttack(move)
            case "skip":
                return await this._handleSkip(move)
            default:
                throw Error("Unknown move type")
        }
    }

    async _handleSwap(move): Promise<boolean> {
        const player = this._getActivePlayer(move)
        const otherPlayer = this._getOtherPlayer(move)

        const newPokemon = player.party.filter(x => x._id == move.id)[0]
        player.pokemon = newPokemon

        player.rpgPlayer.emit("battle__swap", move);
        otherPlayer.rpgPlayer.emit("battle__swap", move);

        // Display the message for two seconds
        await sleep(2000)

        return true;
    }

    async _handleAttack(move): Promise<boolean> {
        const attacker = this._getActivePlayer(move)
        const defender = this._getOtherPlayer(move)
        const isStruggle = move["name"] == "struggle"
        let attack;

        if (isStruggle) {
            attack = {
                name: 'Struggle',
                type: 'Normal',
                power: 0,
                mp: 0,
                accuracy: 0
            }
        } else {
            attack = attacker.pokemon.attacks[move["name"]]
        }

        const isMiss = !isStruggle && Math.random() > attack.accuracy 
        const attackData = { ...move, isMiss, power: { total: 0 } }

        let newHp = defender.pokemon.hp
        let newMp = Math.max(attacker.pokemon.mp - attack.mp, 0)

        if (!isMiss && !isStruggle) {
            const damage = new Damage(attack, attacker.pokemon, defender.pokemon)
            attackData.power = damage.power(defender.pokemon)

            newHp = Math.max(defender.pokemon.hp - attackData.power.total, 0)
        }

        defender.pokemon.hp = attackData.newHp = newHp
        attacker.pokemon.mp = attackData.newMp = newMp

        attacker.rpgPlayer.emit("battle__attack", attackData)
        defender.rpgPlayer.emit("battle__attack", attackData)

        await sleep(2500)

        // handle faints
        if (defender.pokemon.hp <= 0) {
            const hasRemainingPokemon = defender.party.some(x => x.hp > 0)

            if (hasRemainingPokemon) {
                const swapData = await waitForIo(defender.rpgPlayer, "battle__fainted")
                await this._handleSwap(swapData)
            } else {
                await this._handleWinner(attacker)
            }

            return false;
        }

        return true;
    }

    async _handleSkip(move): Promise<boolean> {
        const player = this._getActivePlayer(move)
        const otherPlayer = this._getOtherPlayer(move)

        // Check for 3 consecutive skips
        if (this.turn_number >= 2) {
            let all_skips = true

            for (var i = this.turn_number; i > this.turn_number - 3; --i) {
                if (this.turns[i][move.player].type != "skip") {
                    all_skips = false
                    break;
                }
            }

            if (all_skips) {
                this._handleWinner(otherPlayer, true, true)
                return false
            }
        }

        player.rpgPlayer.emit("battle__skip", move);
        otherPlayer.rpgPlayer.emit("battle__skip", move);

        await sleep(2000)
        return true;
    }

    async _handleWinner(player, otherPlayerRan = false, afk = false) {
        this.finished = true;

        const otherPlayer = player == this.p1 ? this.p2.rpgPlayer : this.p1.rpgPlayer;

        player.rpgPlayer.emit("battle__finished", {
            runnerName: otherPlayerRan ? otherPlayer.name : null,
        })

        otherPlayer.emit("battle__finished", { afk })

        // todo - track stats
    }

    _resetHp(party) {
        for (let pokemon of party) {
            pokemon.hp = pokemon.stats.hp

            if (!pokemon.stats.mp) {
                pokemon.stats.mp = 100
            }

            pokemon.mp = pokemon.stats.mp
        }
    }
}