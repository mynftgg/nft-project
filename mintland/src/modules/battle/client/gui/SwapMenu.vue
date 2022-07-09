<template>
    <div class="bottom-menu">
        <div class="box-left battle-button-grid">
             <div
                v-for="(pokemon, index) in swappablePokemon"
                @click="handleClick(pokemon, index)"
                @mouseover="setActiveIdx(index)"
                :class="getClass(index)"
                :key="index">
                <img :src="pokemon.originalImage" />
                <span>{{pokemon.name}}</span>
            </div>
        </div>
        <div class="battle-box right">
            <p><b>Type:</b> {{ activePokemon.type[0] }}</p>
            <p><b>HP:</b> {{ activePokemon.hp }}/{{ activePokemon.stats.hp }}</p>
            <p><b>MP:</b> {{ activePokemon.mp }}/{{ activePokemon.stats.mp }}</p>
        </div>
    </div>
</template>

<script>
    import { Control } from "@rpgjs/client"
    import { isMobile, getGridIndex } from "../../../../utils/utils.ts"

    export default {
        props: ["swappablePokemon"],
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
            activePokemon() {
                return this.swappablePokemon[this.activeIdx]
            }
        },
        methods: {
            getClass(idx) {
                return {
                    'battle-button': true,
                    'active': idx == this.activeIdx,
                }
            },
            setActiveIdx(idx) {
                if (!this.isMobile) {
                    this.activeIdx = idx
                }
            },
            handleClick(pokemon, index) {
                if (!this.isMobile || index == this.activeIdx) {
                    this.sendSwap(pokemon)
                } else {
                    this.activeIdx = index
                }
            },
            sendSwap(pokemon) {
                this.$emit("move", {
                    type: "swap",
                    id: pokemon._id
                })
            },
            handleKey(control) {
                if (!control) return

                if (control.actionName == Control.Action) {
                    this.sendSwap(this.activePokemon)
                } else if (control.actionName == Control.Back) {
                    this.$emit("back")
                } else {
                    this.activeIdx = getGridIndex(
                        this.activeIdx, control.actionName, this.swappablePokemon.length
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
