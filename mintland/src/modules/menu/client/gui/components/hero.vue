<template>
    <div class="hero">
        <div class="face-column">
            <div class="nft-icon" :style="image"></div>
            <div class="party">
                <div class="party-status">
                    <span v-if="inParty">In Party</span>
                    <span v-if="inParty && this.isLeader" style = "color: #DD8E11;">{{this.isLeader ? "[LEADER]" : ""}}</span>             
                    <span v-if="!inParty">Not In Party</span>
                </div>
                <button v-if="!inParty && !partyFull" @click="addToParty" class="menu-button" style="background-color: #2B8202" >Add to Party</button>
                <button v-if="inParty" @click="removeFromParty" class="menu-button" style="background-color: #B90000">Remove From Party</button>
                <button v-if="inParty && !isLeader" @click="setPartyLeader" class="menu-button" style="background-color: #DD8E11">Set Party Leader</button>
            </div>
        </div>
        <div class="right">
            <div class="text-wrapper">
                <div class="nft-name">{{ nft.name }}</div>
                <div class="level"><span class="param-name">Level</span> <span>{{ nft.stats.level }}</span></div>
                <div class="bar">
                    <bar :nb="round(nft.hp)" :max="nft.stats.hp" name="HP"  color="orange" />
                </div>
                <div class="bar">
                    <bar :nb="round(nft.stats.exp)" :max="100" name="EXP"  color="blue" />
                </div>
            </div>
            <div class="text-wrapper">
                <h2><span class="param-name">Type: </span>{{nft.type[0]}} {{getTypeEmoji}}</h2>
                <h2><span class="param-name">Moves:</span></h2>
                <div class="moves">
                    <div
                        v-for="attack in Object.values(nft.attacks)"
                        :key="attack.name"
                        class="move">
                        <span>{{attack.name}}</span>          
                    </div>
                </div>
            </div>
            <div class="minigame-buttons">
                <button class="menu-button" @click="openFlappy">Train in Flappy NFT</button>
                <button class="menu-button" @click="openDoodle">Train in NFT Jump</button>
            </div>
        </div>
    </div>
</template>

<script>
import Bar from './bar.vue'

export default {
    props: ['nft', 'party'],
    inject: ['rpgSocket'],
    computed: {
        image() {
            return {
                'background-image': `url(${this.nft.originalImage})`
            }
        },
        inParty() {
            return this.party.some(x => x._id == this.nft._id)
        },
        isLeader() {
            return this.party && this.party[0]._id == this.nft._id
        },
        partyFull() {
            return this.party.length == 3
        },
        getTypeEmoji() {
            if (this.nft.type[0] == "fire"){
                return "🔥"
            } else if (this.nft.type[0] == "water"){
                return "💧"
            }
            else if (this.nft.type[0] == "electric"){
                return "⚡️"
            }
            else if (this.nft.type[0] == "grass"){
                return "🍃"
            } else {
                return ""
            }            
        }
    },
    methods: {
        round(val) {
            return Math.round(val * 100) / 100
        },
        getAttackClass(attack) {
            return ["move", attack.type]
        },
        addToParty() {
            this.$emit("add-to-party", { _id: this.nft._id })
        },
        removeFromParty() {
            this.$emit('remove-from-party', { _id: this.nft._id })
        },
        setPartyLeader() {
            this.$emit('set-party-leader', { _id: this.nft._id })
        },
        openFlappy() {
            this.$emit('hide-menu')
            this.rpgSocket().emit('openFlappy', this.nft)
        },
        openDoodle() {
            this.$emit('hide-menu')
            this.rpgSocket().emit('openDoodle', this.nft)
        }
    },
    components: {
        Bar
    }
}
</script>

<style scoped lang="scss">

.hero {
    display: flex;
    color: white;
    font-family: 'Inconsolata';
}

.right {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    margin-left: 20px;
}

.face-column {
    display: flex;
    flex-direction: column;
}

.nft-icon {
    background-position: center;
    background-size: cover;
    width: 160px;
    height: 160px;
    border-radius: 6px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.text-wrapper {
    h2 {
        font-size: 18px;
        margin: 10px 0;
        text-transform: capitalize;
    }
}

.nft-name {
    font-family: 'Press Start 2P';
    font-size: 14px;
}

.param-name {
    color: #71acff;
    font-weight: 600;
    font-size: 18px;
}

.level {
    margin: 10px 0;
}

.bar {
    margin: 10px 0;
}

.moves {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
}

.move {
    text-transform: capitalize;
}

.party {
    display: flex;
    flex-direction: column;
    background-image: none !important;
}

.menu-button {
    padding: 12px;
    margin-top: 10px;
    background-color: var(--bs-blue);
    font-family: 'Inconsolata';
    font-weight: 600;
    color: white;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.party-status {
    margin: 14px 0 4px;

    span {
        margin-right: 10px;
    }
}

.minigame-buttons {
    margin-top: 6px;
    display: flex;
    gap: 16px;
}


@media screen and (max-width: 600px) {
    .hero {
        flex-direction: column;
    }

    .face-column {
        flex-direction: row;
    }

    .right {
        margin-left: 0;
        margin-top: 20px;
    }

    .party {
        justify-content: flex-end;
        margin-left: 20px;
    }

    .party-status {
        margin-top: 0;
    }
}
</style>