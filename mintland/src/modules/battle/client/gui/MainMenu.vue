<template>
    <div class="bottom-menu">
        <div class="battle-box box-left">
            {{text}}
        </div>
        <div class="box-right battle-button-grid">
            <div
                v-for="(option, index) in options"
                :key="option"
                @click="$emit('option', option)"
                @mouseover="setActiveIdx(index)"
                :class="getOptionClass(index)">
                <span>{{option}}</span>
            </div>
        </div>
    </div> 
</template>

<script>
    import { Control } from "@rpgjs/client"
    import { getGridIndex } from "../../../../utils/utils.ts"

    export default {
        props: ["text"],
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
                options: [
                    'attack',
                    'swap',
                    'item',
                    'run'
                ]
            }
        },
        methods: {
            setActiveIdx(idx) {
                this.activeIdx = idx
            },
            getOptionClass(idx) {
                return {
                    'battle-button': true,
                    'active': idx == this.activeIdx,
                }
            },
            handleKey(control) {
                if (!control) return

                if (control.actionName == Control.Action) {
                    this.$emit("option", this.options[this.activeIdx])
                } else {
                    this.activeIdx = getGridIndex(
                        this.activeIdx, control.actionName, this.options.length
                    )
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.battle-button.active {
    &::before {
        content: "▶";
        position: absolute;
        left: 15px;
        font-size: 20px;
        font-weight: 900;
    }
}
</style>
