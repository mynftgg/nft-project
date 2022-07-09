<template>
    <div class="bottom-menu">
        <div class="box-left battle-button-grid">
            <div
                v-for="(attack, index) in availableAttacks"
                :key="attack.name"
                @click="handleClick(attack, index)"
                @mouseover="setActiveAttack(index)"
                :class="getAttackClass(index)">
                <span>{{attack.name}}</span>
            </div>
        </div>
        <div class="battle-box right">
            <p><b>Type:</b> {{activeAttack.type}}</p>
            <p><b>Power:</b> {{activeAttack.power}}</p>
            <p><b>MP:</b> {{activeAttack.mp}}</p>
            <p><b>Accuracy:</b> {{activeAttack.accuracy}}</p>
        </div>
    </div> 
</template>

<script>
    import { Control } from "@rpgjs/client"
    import { isMobile, getGridIndex } from "../../../../utils/utils.ts"

    export default {
        props: ["pokemon"],
        inject: ["rpgKeypress"],
        mounted() {
            this.obsKeyPress = this.rpgKeypress.subscribe(({ control }) => this.handleKey(control))
        },
        unmounted() {
            this.obsKeyPress.unsubscribe();
        },
        data() {
            return {
                activeIdx: 0,
                isMobile: isMobile()
            }
        },
        computed: {
            availableAttacks() {
                const attacks = Object.values(this.pokemon.attacks).filter(x => x.mp <= this.pokemon.mp)

                if (attacks.length > 0) {
                    return attacks
                } else {
                    return [
                        {
                            name: 'struggle',
                            type: 'normal',
                            power: 0,
                            mp: 0,
                            accuracy: 0
                        }
                    ]
                }
            },
            activeAttack() {
                return this.availableAttacks[this.activeIdx]
            }
        },
        methods: {
            setActiveAttack(idx) {
                if (!this.isMobile) {
                    this.activeIdx = idx
                }
            },
            getAttackClass(idx) {
                const classes = {
                    'battle-button': true,
                    'active': idx == this.activeIdx,
                }

                const type = this.availableAttacks[idx].type
                classes[type] = true

                return classes
            },
            handleClick(attack, index) {
                if (!this.isMobile || index == this.activeIdx) {
                    this.sendAttack(attack.name)
                } else {
                    this.activeIdx = index;
                }
            },
            sendAttack(name) {
                this.$emit("move", {
                    type: "attack",
                    name
                })
            },
            handleKey(control) {
                if (!control) return

                if (control.actionName == Control.Action) {
                    this.sendAttack(this.activeAttack.name)
                } else if (control.actionName == Control.Back) {
                    this.$emit("back")
                } else {
                    this.activeIdx = getGridIndex(
                        this.activeIdx, control.actionName, this.availableAttacks.length
                    )
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.right {
    max-width: 240px;
    box-sizing: border-box;
    width: 30%;
    margin-left: 0;

    @media (max-width: 600px) {
        width: 100%;
        max-width: unset;
    }
}

.battle-button.active {
    &::before {
        content: "▶";
        position: absolute;
        left: 15px;
        font-size: 20px;
        font-weight: 900;
    }
}

.battle-box > p {
    margin-top: 0;
    margin-bottom: 10px;
    text-transform: capitalize;
}

.fire {
    color: red;
}

.grass {
    color: green;
}

.water {
    color: blue;
}

.electric {
    color: goldenrod;
}

@media screen and (max-width: 600px) {
    .battle-button.active {
        span {
            font-weight: 900;
            text-decoration: underline;
        }

        &::before {
            display: none;
        }
    }
}
</style>
