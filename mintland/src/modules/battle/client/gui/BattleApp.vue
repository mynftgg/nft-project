<template>
    <div class="battle-scene">
        <div class="battle-scene-top">
            <pokemon :pokemon="this.opponentPokemon" position="top" type="opponent" ref="opponent"></pokemon>
            <pokemon :pokemon="this.currentPokemon" position="bottom" type="player" ref="player"></pokemon>
        </div>

        <MainMenu v-if="menu == 'main'" :text="battleText" @option="processOption"/>
        <AttackMenu v-if="menu == 'attack'" :pokemon="currentPokemon" @move="sendMove" @back="showMainMenu"/>
        <SwapMenu v-if="menu == 'swap'" :swappablePokemon="swappablePokemon" @move="sendMove" @back="showMainMenu"/>
        <WaitingMenu v-if="menu == 'waiting'" :text="battleText"/>

        <div class="back-button" v-if="menu != 'main' && menu != 'waiting' && !fainted" @click="showMainMenu()">Back</div>
        <div class="close-button" v-if="finished" @click="close()">X</div>

        <Timer v-if="timerSeconds > 0" :seconds="timerSeconds" />
    </div>
</template>


<script>
    import Pokemon from './Pokemon.vue';
    import Timer from './Timer.vue';
    import MainMenu from './MainMenu.vue'
    import AttackMenu from './AttackMenu.vue';
    import SwapMenu from './SwapMenu.vue';
    import WaitingMenu from './WaitingMenu.vue';
    import Velocity from 'velocity-animate'
    import { sleep } from '../../../../utils/utils.ts'

    export default {
        name: "BattleApp",
        inject: ['rpgEngine', 'rpgSocket'],
        props: ['playerType', 'p1', 'p2'],
        components: {
            MainMenu,
            AttackMenu,
            SwapMenu,
            WaitingMenu,
            Pokemon,
            Timer,
        },
        data() {
            this.p1.pokemon = this.p1.party[0]
            this.p2.pokemon = this.p2.party[0]

            return {
                battleText: "What will you do?",
                menu: 'main',
                fainted: false,
                finished: false,
                timerSeconds: -1
            };
        },
        mounted() {
            this.rpgEngine.controls.stopInputs()
            this.rpgSocket().on("battle__skip", this.handleSkip)
            this.rpgSocket().on("battle__swap", this.handleSwap)
            this.rpgSocket().on("battle__attack", this.handleAttack)
            this.rpgSocket().on("battle__reset", this.resetBattle)
            this.rpgSocket().on("battle__finished", this.setFinished)
            this.resetBattle()
        },
        unmounted() {
            this.rpgEngine.controls.listenInputs()
            this.rpgSocket().off("battle__skip")
            this.rpgSocket().off("battle__swap")
            this.rpgSocket().off("battle__attack")
            this.rpgSocket().off("battle__reset")
            this.rpgSocket().off("battle__finished")
        },
        computed: {
            currentPlayer() {
                return this.playerType == "p1" ? this.p1 : this.p2
            },
            opponentPlayer() {
                return this.playerType == "p1" ? this.p2 : this.p1
            },
            currentPokemon() {
                return this.currentPlayer.pokemon
            },
            opponentPokemon() {
                return this.opponentPlayer.pokemon
            },
            swappablePokemon() {
                return this.currentPlayer.party.filter(x => x != this.currentPokemon && x.hp > 0)
            }
        },
        methods: {
            getActivePlayer(move) {
                return move["player"] == "p1" ? this.p1 : this.p2
            },
            getOtherPlayer(move) {
                return move["player"] == "p1" ? this.p2 : this.p1
            },
            showMainMenu() {
                this.menu = 'main';
                this.battleText = `What will ${this.currentPokemon.name} do?`;
            },
            resetBattle() {
                this.clearTimer()
                this.showMainMenu()
                this.setTimer(10, this.sendSkip)
            },
            async processOption(option) {
                switch (option) {
                    case "main":
                        this.menu = "main"
                        break
                    case "attack":
                        this.menu = "attack"
                        break
                    case "swap":
                        if (this.swappablePokemon.length > 0) {
                            this.menu = "swap";
                        } else {
                            await this.showText("No available NFTs to swap to.", 2000)
                        }
                        break
                    case "item":
                        await this.showText("No items in bag.", 2000)
                        break
                    case "run":
                        this.rpgSocket().emit("battle__run", { player: this.playerType })
                        break
                }
            },
            async showText(text, ms) {
                const prevText = this.battleText
                this.battleText = text
                await sleep(ms)
                this.battleText = prevText
            },
            setTimer(seconds, callback) {
                this.timerSeconds = seconds
                this.timerCallback = setTimeout(() => {
                    callback()
                    this.timerSeconds = -1
                }, seconds * 1000)
            },
            clearTimer() {
                this.timerSeconds = -1;
                clearTimeout(this.timerCallback)
                this.timerCallback = null;
            },
            sendSkip() {
                this.menu = "waiting"
                this.rpgSocket().emit("battle__move", {
                    player: this.playerType,
                    type: "skip"
                })
            },
            sendMove(move) {
                this.clearTimer()
                const moveType = this.fainted ? "battle__fainted" : "battle__move";
                this.rpgSocket().emit(moveType, {...move, player: this.playerType})
                this.battleText = "Waiting for opponent to make their move"
                this.menu = "waiting"
                this.fainted = false
            },
            handleSwap(move) {
                if (this.finished) return
                const activePlayer = this.getActivePlayer(move)
                const newPokemon = activePlayer.party.filter(x => x._id == move["id"])[0]
                this.battleText = `${activePlayer.name} switched out ${activePlayer.pokemon.name} for ${newPokemon.name}`
                activePlayer.pokemon = newPokemon
            },
            handleSkip(move) {
                if (this.finished) return
                const activePlayer = this.getActivePlayer(move)
                this.battleText = `${activePlayer.name} didn't make a move in time.`
            },
            async handleAttack(move) {
                if (this.finished) return

                const attacker = this.getActivePlayer(move)
                const defender = this.getOtherPlayer(move)

                this.battleText = `${attacker.pokemon.name} used ${move.name}!`;

                const attackerElt = attacker == this.currentPlayer ? this.$refs.player : this.$refs.opponent;
                const defenderElt = defender == this.currentPlayer ? this.$refs.player : this.$refs.opponent;

                // Show attack animation
                Velocity(document.getElementById(attackerElt.pokemonImageId), 'callout.pulse')
                attacker.pokemon.mp = move.newMp

                await sleep(400)

                // Show damage animation
                if (move.isMiss) {
                    defenderElt.showAttackEffect('Missed!');
                } else if (move.power.total > 0) {
                    Velocity(document.getElementById(defenderElt.pokemonImageId), 'callout.bounce');

                    if (move.power.typeEffect <= 0.5) {
                        defenderElt.showAttackEffect('Not very effective');
                    } else if (move.power.typeEffect > 1) {
                        defenderElt.showAttackEffect('Very effective');
                    }

                    if (move.power.critical > 1) {
                        defenderElt.showAttackEffect('Critical hit!');
                    }

                    defenderElt.showAttackEffect(move.power.total);
                } else {
                    defenderElt.showAttackEffect('Had no effect');
                }

                // Wait for animation to finish before decreasing hp
                await sleep(200)
                defender.pokemon.hp = move.newHp

                if (defender.pokemon.hp <= 0) {
                    // Wait before showing fainted message
                    await sleep(2000)
                    const hasRemainingPokemon = defender.party.some(x => x.hp > 0)
                    let msg = `${defender.pokemon.name} fainted.`

                    if (defender == this.currentPlayer) {
                        if (hasRemainingPokemon) {
                            msg += " Switch to another NFT."
                            this.menu = "swap"
                            this.fainted = true;
                            // Default to first in party if no selection in time
                            this.setTimer(10, () => this.sendSwap(this.swappablePokemon[0]))
                        } else {
                            msg += " You lose."

                            this.rpgSocket().emit("addExp", {
                                nfts: this.currentPlayer.party.map(x => ({
                                    id: x._id,
                                    amount: 10 
                                }))
                            })
                        }
                    } else {
                        if (hasRemainingPokemon) {
                            msg += " Waiting for opponent to swap to another NFT."
                        } else {
                            msg += " You win!"
                            this.rpgSocket().emit("winner", {winner: attacker, loser: defender})

                            this.rpgSocket().emit("addExp", {
                                nfts: this.currentPlayer.party.map(x => ({
                                    id: x._id,
                                    amount: 20 
                                }))
                            })
                        }
                    }

                    this.battleText = msg
                }
            },
            setFinished(data) {
                this.clearTimer()
                this.finished = true
                this.menu = "waiting"

                if (data.runnerName) {
                    this.battleText = `${data.runnerName} ran from the battle!`
                } else if (data.afk) {
                    this.battleText = `Battle ended due to inactivity!`
                }

                setTimeout(this.close, 5000)
            },
            close() {
                this.clearTimer()
                this.rpgSocket().emit("battle__close")
            }
        }
    }
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
    @import url('https://fonts.googleapis.com/css?family=PT+Sans+Narrow');

    /* html, body {
        height: 100%;
        background: #3C7ACD;
    }

    body {
        display: flex;
        justify-content: center;
        align-items: center;
    } */

    .title {
        position: relative;
        margin-top: 10px;
        color: white;
        text-align: center;
        font-size: 28px;
        text-transform: uppercase;
        font-family: "Roboto Condensed";
    }

    .battle-scene {
        position: relative;
        margin: auto;
        display: block;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
        z-index: 99;
        display: flex;
        flex-direction: column;
    }

    .battle-scene-top {
        position: relative;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .box-top-left {
        position: absolute;
        border-radius: 10px;
        left: 40px;
        right: 40px;
        top: 20px;
        background: white;
        border: 6px solid #413e65;
    }

    .box-top-right {
        position: absolute;
        height: 25%;
        border-radius: 50%;
        bottom: -12.5%;
        left: 120px;
        right: 20px;
        min-height: 60px;
        background: white;
        border-bottom: 20px solid #ededed;
    }
    .box-top-right div.battle-effectiveness {
        position: absolute;
        z-index: 1;
        left: 26px;
        width: 200px;
        text-align: center;
        top: -50px;
        font-family: 'Inconsolata';
        font-size: 1.2em;
        font-weight: bold;
        color: white;
    }

    .box-bottom-left {
        position: absolute;
        height: 40%;
        border-radius: 50%;
        bottom: -10%;
        left: 20px;
        right: 20px;
        min-height: 80px;
        background: white;
        border-bottom: 30px solid #ededed;
    }
    .box-bottom-left div.battle-effectiveness {
        position: absolute;
        z-index: 1;
        left: 26px;
        width: 200px;
        text-align: center;
        top: -65px;
        font-family: 'Inconsolata';
        font-size: 1.2em;
        font-weight: bold;
        color: white;
    }

    .box-bottom-right {
        position: absolute;
        left: 40px;
        right: 40px;
        bottom: 20px;
        border-radius: 10px;
        background: white;
        border: 6px solid #413e65;
        z-index: 2;
    }

    .hp {
        position: absolute;
        right: 8%;
        bottom: -20%;
        opacity: 0.7;
        font-size: 16px;
        font-family: "Roboto Condensed";
    }

    .bottom-menu {
        width: 100%;
        height: 200px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 1;
        box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.6);
        box-sizing: border-box;
        display: flex;
        padding: 20px;
    }

    .battle-box {
        background-color: white;
        border-radius: 10px;
        border: 6px solid #413e65;
        font-size: 18px;
        font-family: 'Inconsolata';
        padding: 20px;
        text-align: left;
    }

    .box-left {
        flex-grow: 1;
        position: relative;
        margin-right: 20px;
    }

    .box-right {
        width: 40%;
        max-width: 320px;
        position: relative;
        box-sizing: border-box;

        @media (max-width: 768px) {
            width: 100%;
        }

        @media (min-width: 768px) {
            max-width: 400px;
        }
    }

    .back-button {
        height: 40px;
        width: 80px;
        z-index: 99;
        background-color: white;
        border-radius: 10px;
        position: absolute;
        left: 20px;
        bottom: 200px;
        box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.2);
        font-family: 'Press Start 2P';
        line-height: 40px;
        text-align: center;
        font-size: 12px;
        cursor: pointer;
    }

    .battle-button-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px;
    }

    .battle-button {
        cursor: pointer;
        user-select: none;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: capitalize;
        border: 6px solid #413e65;
        background-color: white;
        border-radius: 10px;
        color: #413e65;
        padding: 0 36px;
        box-sizing: border-box;
        min-height: 60px;

        img {
            height: 30px;
            width: 30px;
            border-radius: 100px;
            margin-right: 10px;
        }

        span {
            font-family: 'Press Start 2P';
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            line-height: 133%;
        }
    }

    .close-button {
        height: 40px;
        width: 40px;
        border-radius: 100%;
        background-color: white;
        box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.2);
        color: black;
        text-align: center;
        font-size: 16px;
        line-height: 40px;
        font-weight: 900;
        font-family: 'Press Start 2P';
        position: absolute;
        z-index: 99;
        top: 20px;
        right: 20px;
        cursor: pointer;
    }

    @media screen and (max-width: 600px) {
        .bottom-menu {
            flex-direction: column;
            height: 30%;
            max-width: unset;
            overflow: scroll;
        }

        .box-left {
            margin: 0;
            margin-bottom: 10px;
            max-width: unset;
        }

        .box-right {
            margin: 0;
            max-width: unset;
        }

        .back-button {
            bottom: 30%;
            font-weight: 600;
            height: 30px;
            font-size: 14px;
            width: 60px;
            font-family: 'Inconsolata';
            line-height: 30px;
        }

        .battle-box {
            padding: 15px;
            font-size: 15px;
        }

        .battle-button-grid {
            grid-template-rows: unset;
            gap: 5px;
        }

        .battle-button {
            span {
                font-family: 'Inconsolata';
                font-size: 16px;
            }

            &.active::before {
                display: none;
            }
        }
    }
</style>
