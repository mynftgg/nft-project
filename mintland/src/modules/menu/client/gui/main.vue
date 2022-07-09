<template>
    <div class="menu-main" v-if="visible">
        <div class="menu-left" v-if="trainers && trainers.length">
            <rpg-window>
                <div class="trainer-menu">
                    <img class="trainer-img" :src="trainer.image"/>
                    <div class="trainer-select-menu">
                        <template v-if="!editing">
                            <h1 class="trainer-name">{{ trainer.name }}</h1>
                            <div v-if="editable" @click="editTrainer">
                                <!-- from bootstrap icon set -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                </svg>
                            </div>
                        </template>
                        <template v-if="editing">
                            <select class="form-select" aria-label="Trainer select" @change="setTrainer">
                                <option
                                    v-for="(trainer, idx) in trainers"
                                    :key="trainer.id"
                                    :value="idx"
                                    :selected="_activeTrainerIdx == idx">
                                    {{trainer.name}}
                                </option>
                            </select>
                        </template>
                    </div>
                    <div class="nft-properties">
                        <div class="nft-property" v-for="attr in trainer.attributes" :key="attr.trait_type">
                            <span class="property-name">{{ attr.trait_type }}</span>
                            <span class="property-value">{{ attr.value }}</span>
                        </div>
                    </div>
                </div>
            </rpg-window>
        </div>
        <div class="menu-right">
            <component
                :is="layout"
                :nfts="_nfts"
                :party="_party"
                ref="layout"
                @hide-menu="hide"
                @show-menu="show"
            />
        </div>
       <BackButton />
    </div>
</template>

<script>
import MainLayout from './layouts/main.vue'
import BackButton from '@rpgjs/default-gui/src/components/back.vue'

export default {
    name: 'main-menu',
    inject: ['rpgEngine', 'rpgStage', 'rpgGui', 'rpgSocket', 'rpgKeypress', 'rpgGuiClose'],
    props: ['nfts', 'party', 'trainers', 'activeTrainerIdx'],
    data() {
        return {
            player: {},
            layout: 'MainLayout',
            visible: true,
            refreshing: false,
            editing: false,
            _activeTrainerIdx: this.activeTrainerIdx,
            _nfts: this.nfts,
            _party: this.party
        }
    },
    computed: {
        hasNfts() {
            return this._nfts && this._nfts.length > 0
        },
        refreshText() {
            return this.refreshing ? "Refreshing NFTs..." : "Refresh NFTs"
        },
        trainer() {
            return this.trainers[this._activeTrainerIdx]
        },
        editable() {
            return this.trainers.length > 1
        }
    },
    mounted() {
        if (this.rpgGui.exists('rpg-controls')) this.rpgGui.hide('rpg-controls')
        this.rpgEngine.controls.stopInputs()
        const blur = new PIXI.filters.BlurFilter()
        this.rpgStage.filters = [blur]

        this.obsKeyPress = this.rpgKeypress.subscribe(({ inputName, control }) => {
            if (control && control.actionName == 'back') {
                this.close()
            }
        })

        this.rpgSocket().on("refreshNfts__completed", (data) => {
            this._nfts = data
            this._party = this._nfts.slice(0, 3)
            this.refreshing = false
        })
    },
    unmounted() {
        this.rpgEngine.controls.listenInputs()
        this.obsKeyPress.unsubscribe()
        this.rpgSocket().off("refreshNfts__completed")
        this.refreshing = false
        this.rpgStage.filters = []
        if (this.rpgGui.exists('rpg-controls')) this.rpgGui.display('rpg-controls')
    },
    methods: {
        change(name) {
            this.layout = name
        },
        hide() {
            this.visible = false;
        },
        show() {
            this.visible = true;
        },
        close() {
            this.rpgGuiClose('main-menu')
        },
        editTrainer() {
            this.editing = true
        },
        setTrainer(evt) {
            this._activeTrainerIdx = evt.target.value
            this.rpgSocket().emit("setTrainer", { activeTrainerIdx: this._activeTrainerIdx })
            this.editing = false
        },
        refreshNfts() {
            if (this.refreshing) {
                return
            }

            this.rpgSocket().emit("refreshNfts")
            this.refreshing = true
        },

    },
    components: {
        MainLayout,
        BackButton
    }
}
</script>

<style lang="scss" scoped>
.menu-main {
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 100;
    overflow-y:auto;
    display: flex;
}

.menu-left {
    max-width: 360px;
    width: 30vw;
}

.menu-item {
    font-size: 18px;
    font-family: 'Inconsolata';
    font-weight: 600;
    color: white;
}

.menu-right {
    flex-grow: 1;
    margin-top: -20px;
}

.gold {
    cursor: pointer;
}

.trainer-menu {
    display: flex;
    flex-direction: column;
    color: white;
}

.trainer-img {
    width: 100%;
    border-radius: 6px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.trainer-select-menu {
    display: flex;
    align-items: center;

    svg {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
}

.trainer-name {
    font-family: 'Press Start 2P';
    font-size: 16px;
    margin: 20px 0;
    flex-grow: 1;
}

.form-select {
    margin: 16px 0;
}

.nft-properties {
    display: flex;
    flex-wrap: wrap;
}

.nft-property {
    display: flex;
    flex-direction: column;
    font-family: 'Inconsolata';
    border-radius: 4px;
    border: 1px solid white;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 4px 8px;
    margin-right: 6px;
    margin-bottom: 10px;

    .property-name {
        font-weight: 600;
    }
}

@media screen and (max-width: 600px) {
    .menu-main {
        flex-direction: column;
    }

    .menu-left {
        width: 100%;
        max-width: unset;
    }

    .menu-right {
        margin-top: 20px;
    }
}
</style>