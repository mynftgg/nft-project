<template>
<div class = "scrollable">
    <div class="menu-row" v-for="nft in nfts" :key="nft.id">
        <div class="menu-right">
            <rpg-window :fullWidth="true" height="100%">
                <Hero
                    class="hero-face"
                    :nft="nft"
                    :party="localParty"
                    @add-to-party="addToParty"
                    @remove-from-party="removeFromParty"
                    @set-party-leader="setPartyLeader"
                />
            </rpg-window>
        </div>
    </div>
</div>
</template>

<script>

import Hero from '../components/hero.vue'

export default {
    props: ['nfts', 'party'],
    inject: ['rpgSocket'],
    data() {
        return {
            localParty: this.party,
        }
    },
    watch: {
        party(newValue) {
            this.localParty = newValue
        }
    },
    methods: {
        addToParty(data) {
            const nft = this.nfts.filter(x => x._id == data._id)[0]
            this.localParty = [...this.localParty, nft]
            this.rpgSocket().emit("addToParty", data)
        },
        removeFromParty(data) {
            this.localParty = this.localParty.filter(x => x._id != data._id)
            this.rpgSocket().emit("removeFromParty", data)
        },
        setPartyLeader(data) {
            const nft = this.nfts.filter(x => x._id == data._id)[0]
            const others = this.localParty.filter(x => x._id != data._id)
            this.localParty = [nft, ...others]
            this.rpgSocket().emit("setPartyLeader", data)
        }
    },
    components: {
        Hero
    }
}
</script>

<style scoped lang="scss">

.menu-row {
    flex-direction: row;
    display: flex;
    margin-top: 20px;
    // height: 100%;
}

.menu-left {
    width: 320px;
    display: flex;
    flex-direction: column;
    flex-flow: row wrap;
}

.menu-choice {
    align-items: flex-start;
    width: 100%;
}

.menu-left .gold {
    align-items: flex-end;
    width: 100%;
}

.menu-right {
    width: 100%;
    margin-left: 1px;
}

.scrollable {
   overflow-y: auto;
}
</style>