<template>
    <div class="wrapper" :key="publicKey" >
        <template v-if="useDemo">
            <form @submit.prevent="joinDemo(maps[0])">
                <div>
                    <span>Use custom wallet: </span>
                    <label class="switch">
                        <input type="checkbox" v-model="useCustomWallet">
                        <span class="slider round"></span>
                    </label>
                </div>
                <input v-if="useCustomWallet" v-model="customWalletAddress" :class="walletInputClass" placeholder="Enter a wallet address"/>
                <input v-model="username" placeholder="Enter a username"/>
                <div class="map-list">
                    <h2>Pick a map</h2>
                    <div class="map-button" v-for="map in maps" :key="map.id" v-on:click="joinDemo(map)">
                        {{ map.name }}
                    </div>
                </div>
            </form>
        </template>

        <template v-if="!useDemo">
            <wallet-modal-provider>
                <wallet-multi-button></wallet-multi-button>
            </wallet-modal-provider>
        </template>

        <template v-if="loading">
            <p>Loading...</p>
        </template>

        <template v-if="connected && !loading && ownsTrainer">
            <div class="username" v-if="!editing">
                <h1>{{savedUsername}}</h1>
                <button v-on:click="showEdit">Edit</button>
            </div>
            <form @submit.prevent="setUsername" v-if="editing">
                <input v-model="username" placeholder="Enter a username">
                <button>Save</button>
            </form>
            <div class="map-list" v-if="savedUsername">
                <h2>Maps</h2>
                <div class="map-button" v-for="map in maps" :key="map.id" v-on:click="joinMap(map)">
                    {{ map.name }}
                </div>
            </div>
        </template>

        <template v-if="connected && !loading && !ownsTrainer">
            <h3>No Trainer Found</h3>
            <p>
                Visit <a class="me-link" href="https://magiceden.io/marketplace/mynftgg">MagicEden</a>
                to get a trainer + access to the full game.
            </p>
        </template>
    </div>
</template>

<script>
import axios from 'axios'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-vue';
import { WalletMultiButton, WalletModalProvider } from '@solana/wallet-adapter-vue-ui';

import { PUBLIC_MAPS, PUBLIC_MAPS_DEMO } from '../../shared/maps';
import { serverURL } from '../../shared/config';
import { getRandomInt } from '../../../../utils/utils'

import '@solana/wallet-adapter-vue-ui/styles.css'

function isValidWallet(address) {
    try {
        let pubkey = new PublicKey(address)
        let isSolana =  PublicKey.isOnCurve(pubkey.toBuffer())
        return isSolana
    } catch (error) {
        return false
    }
}

export default {
    name: 'login-screen',
    inject: ['rpgEngine', 'rpgSocket', 'rpgScene'],
    components: {
        WalletMultiButton,
        WalletModalProvider
    },
    data() {
        // Use the demo option if we're in an iframe
        const useDemo = window.location !== window.parent.location

        return {
            username: '',
            savedUsername: null,
            connected: false,
            loading: false,
            trainers: [],
            publicKey: null,
            editing: false,
            maps: useDemo ? PUBLIC_MAPS_DEMO : PUBLIC_MAPS,
            useDemo,
            useCustomWallet: false,
            customWalletAddress: '',
            walletInputClass: ''
        };
    },
    computed: {
        ownsTrainer() {
            return this.trainers.length > 0;
        }
    },
    watch: {
        async publicKey() {
            // fetch username & owned trainers
            if (this.publicKey) {
                console.log("setting loading true")
                this.loading = true;
                let username = '';
                let response;

                try {
                    response = await axios.get(`${serverURL}/${this.publicKey}/trainers`);
                    this.trainers = response.data.trainers;
                } catch {
                    console.log("unable to get trainers for address", this.publicKey);
                }

                if (this.trainers.length > 0) {
                    try {
                        response = await axios.get(`${serverURL}/${this.publicKey}/username`);
                        username = response.data.username;
                    } catch {
                        console.log("unable to get username for address", this.publicKey);
                    }

                    this.savedUsername = username;
                    this.username = username;
                    this.editing = !username;
                }

                this.loading = false;
            } else {
                // Reset state
                this.editing = false;
                this.loading = false;
            }
        }
    },
    methods: {
        showEdit() {
            this.editing = true;
        },
        async setUsername() {
            if (!this.username) {
                return;
            }

            try {
                await axios.post(`${serverURL}/${this.publicKey}/username`, {
                    username: this.username
                });
            } catch {
                console.log("unable to save username");
            }

            this.savedUsername = this.username;
            this.editing = false;
        },
        joinMap(map) {
            this.rpgSocket().emit('joinMap', {
                playerAddress: this.publicKey.toString(),
                trainerIds: this.trainers.map(x => x.id),
                mapAddress: map.address || '7xUNxHw4sbitL3cu8E9bZpt7VrymEMD5ULdQoeEkNj7k',
                mapId: map.id,
                username:  this.username,
            })
        },
        joinDemo(map) {
            if (!this.username) {
                return;
            }

            let playerAddress

            if (this.useCustomWallet) {
                if (!isValidWallet(this.customWalletAddress)) {
                    this.walletInputClass = 'error';
                    return;
                }

                playerAddress = this.customWalletAddress
            } else {
                const demoWallets = [
                    '7xUNxHw4sbitL3cu8E9bZpt7VrymEMD5ULdQoeEkNj7k',
                ]

                playerAddress = demoWallets[getRandomInt(demoWallets.length)]
            }

            this.rpgSocket().emit('joinMap', {
                playerAddress,
                mapAddress: map.address || '7xUNxHw4sbitL3cu8E9bZpt7VrymEMD5ULdQoeEkNj7k',
                mapId: map.id,
                username: this.username,
            })
        }
    },
    mounted() {
        this.rpgEngine.controls.stopInputs()
        const { connected, publicKey } = useWallet();

        this.pollFn = setInterval(() => {
            this.connected = connected.value;
            this.publicKey = publicKey.value;
        }, 250);
    },
    unmounted() {
        this.rpgEngine.controls.listenInputs();
        clearInterval(this.pollFn);
    }
}
</script>

<style scoped lang="scss">
.wrapper {
    background-color: black;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    font-family: 'Inconsolata';

    form {
        width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    p {
        margin-top: 1em;
    }

    h1, h2 {
        margin-top: 0.5em;
    }
}

input {
    outline: none;
    background-color: unset;
    border: none;
    border-bottom: 2px solid white;
    border-radius: 0;
    color: white;
    font-family: 'Inconsolata';
    font-size: 1em;
    width: 100%;
    max-width: 352px;
    margin: 12px 0;
    transition: 0.4s ease border-color;

    &.error {
        border-bottom: 2px solid red;
    }
}

button {
    background: none;
    outline: none;
    border: 2px solid white;
    border-radius: 6px;
    color: white;
    font-weight: 900;
    font-family: 'Inconsolata';
    font-size: 1em;
    padding: 6px 12px;
    margin: 0 5px 10px;
    cursor: pointer;
}

.map-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.map-button {
    border: 2px solid white;
    border-radius: 6px;
    font-size: 1em;
    width: 180px;
    margin: 5px 0;
    padding: 6px 12px;
    cursor: pointer;
}

.me-link {
    color: #e42575;
}

.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider {
    background-color: rgb(165, 230, 186);
}

input:focus + .slider {
    box-shadow: 0 0 1px rgb(165, 230, 186);
}

input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
