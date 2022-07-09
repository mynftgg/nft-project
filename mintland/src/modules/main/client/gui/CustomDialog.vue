<template>
    <window :position="position" :fullWidth="fullWidth" class="dialog">
        <p>{{ msg }}</p>
        <choices :choices="choices" @selected="close" v-if="isChoice" />
        <Arrow direction="down" :center="true" v-else-if="!autoClose" />
    </window>
</template>

<script>
import Window from '@rpgjs/default-gui/src/window/window.vue'
import Choices from '@rpgjs/default-gui/src/window/choice.vue'
import Arrow from '@rpgjs/default-gui/src/window/arrow.vue'

export const GUI_NAME = 'custom-dialog'

export default {
    name: GUI_NAME,
    inject: ['rpgEngine', 'rpgKeypress', 'rpgGuiClose', 'rpgGui', 'rpgSocket'],
    props: ['message', 'choices', 'position', 'fullWidth', 'autoClose', 'typewriterEffect'],
    data() {
        return {
            msg: ''
        }
    },
    async mounted() {
        let interval
        this.rpgEngine.controls.stopInputs()
        if (!this.isChoice && !this.autoClose) {
            this.obsKeyPress = this.rpgKeypress.subscribe(({ control }) => {
                if (control && control.actionName == 'action') {
                    this.close()
                }
            })
        }
        let index = 0
        const typewriter = () => {
            if (index >= this.message.length) {
                clearInterval(interval)
            } else {
                this.msg = this.msg + this.message[index]
                index++
            }
        }
        if (!this.typewriterEffect) {
            this.msg = this.message
        }
        else {
            interval = setInterval(typewriter, 20)
        }
    },
    computed: {
        isChoice() {
            return this.choices && this.choices.length > 0
        }
    },
    methods: {
        close(indexSelect) {
            this.rpgGuiClose(GUI_NAME, indexSelect)
            this.rpgEngine.controls.listenInputs()
        }
    },
    unmounted() {
        if (this.obsKeyPress) this.obsKeyPress.unsubscribe()
    },
    components: {
        Window,
        Choices,
        Arrow
    }
}
</script>

<style scoped>
.dialog {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 100px;
    display: flex;
    justify-content: center;
    z-index: 101;
}

.dialog >>> .window-content {
    border-radius: 0 5px 0 0;
    border-left: none;
    border-bottom: none;
}

@media (max-width: 600px) {
    .dialog >>> .window-content  {
        padding: 15px !important;
    }

    .dialog p {
        font-size: 1em;
    }
}
</style>
