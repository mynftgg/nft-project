import {
    RpgModule, RpgClient, RpgClientEngine, RpgResource, RpgSceneMapHooks, RpgGui
} from '@rpgjs/client'

import { Animations } from './animations'
import CharacterList from './characters'
import { Tilesets } from './characters/medieval'
import { NFTCharacter } from './characters/nft'
import { Images } from './images'
import { InteriorsTilesets } from './maps/interiors'
import { MedievalTilesets } from './maps/medieval'
import { MuseumTilesets } from './maps/museum'
import { Musics, Sounds } from './sounds'

import CustomDialog from './gui/CustomDialog.vue'
import LoadingIndicator from './gui/LoadingIndicator.vue'
import LoginScreen from './gui/LoginScreen.vue'

import NFTLeaderboard from '../../gui/leaderboard/NFTLeaderboard.vue'

declare var $: any;

declare var window: any;

const mapHooks: RpgSceneMapHooks = {
    onAfterLoading() {
        RpgGui.hide('loading-indicator');
    }
} 

import { initWallet } from '@solana/wallet-adapter-vue';
import { getPhantomWallet, getSolflareWallet, getSolletWallet} from '@solana/wallet-adapter-wallets';

const wallets = [getPhantomWallet(), getSolflareWallet(), getSolletWallet()];
initWallet({ wallets });

const addNftsToSpritesheet = (nfts: any[], engine: RpgClientEngine) => {
    console.log("Adding to spritesheet", nfts)

    nfts.forEach(nft => {
        var character = new NFTCharacter({ image: nft.graphicLink })
        RpgResource.spritesheets.set(nft.characterName, character)
    });

    engine.socket.emit("nftsAddedToSpritesheet", nfts);
}

const handleWalletAddressMessage = (message: any, engine: RpgClientEngine) => {
    if (message.data.walletAddress) {
        // Register for RPG mode
        engine.socket.on("addNftsToSpritesheet", (data) => addNftsToSpritesheet(data, engine));

        // Wait for the server to register its listener
        setTimeout(() => {
            engine.socket.emit("joinMap", {
                "address": message.data.walletAddress
            });
        }, 100);
    }
}

@RpgModule<RpgClient>({
    spritesheets: [
        Tilesets,
        MedievalTilesets,
        MuseumTilesets,
        InteriorsTilesets,
        ...CharacterList,
        Images,
        Animations,
    ],
    sounds: [
        Musics,
        Sounds
    ],
    gui: [
        CustomDialog,
        LoadingIndicator,
        LoginScreen,
        NFTLeaderboard
    ],
    engine: {
        onStart(engine: RpgClientEngine) {
            // Only called in RPG mode
            window.addEventListener("message", event => handleWalletAddressMessage(event, engine), false);
        },
        onConnected(engine: RpgClientEngine) {
            // Register for MMORPG mode
            engine.socket.on("addNftsToSpritesheet", (data) => addNftsToSpritesheet(data, engine));
        }
    },
    scenes: {
        map: mapHooks
    }
})
export default class RpgClientModule { }
