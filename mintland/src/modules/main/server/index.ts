import { RpgModule, RpgServer, RpgPlayer, RpgWorld } from '@rpgjs/server'
import { nftEvent } from './events/nft';
import { tutorialEvent } from './events/tutorial';
import { createDynamicMap } from './maps/dynamicmap'
import { PUBLIC_MAPS, PUBLIC_MAPS_DEMO } from '../shared/maps';
import { serverURL, authToken } from '../shared/config';

import axios from 'axios'

import hashlist from "./hashlist.json"
import { getRandomEntry } from '../../../utils/utils';

function getFormattedAddress(addy: string) {
    return addy.substring(0, 4) + '...' + addy.substring(addy.length - 4);
}

const downloadedNfts = {};
const maps = {};

for (let i = 0; i < PUBLIC_MAPS.length; ++i) {
    const mapData = PUBLIC_MAPS[i];
    maps[mapData.id] = createDynamicMap(mapData.id, mapData.file);
}

for (let i = 0; i < PUBLIC_MAPS_DEMO.length; ++i) {
    const mapData = PUBLIC_MAPS_DEMO[i];

    if (!(mapData.id in maps)) {
        maps[mapData.id] = createDynamicMap(mapData.id, mapData.file);
    }
}

const trainersById = {}

for (let entry of hashlist) {
    trainersById[entry.id] = entry
}

function getTrainers(trainerIds: string[]) {
    if (!trainerIds || trainerIds.length == 0) {
        return null
    }

    const data: any[] = []

    for (let id of trainerIds) {
        data.push(trainersById[id])
    }

    data.sort((a, b) => a.edition - b.edition)
    return data
}

class JoinMapData {
    mapAddress: string;
    playerAddress: string;
    trainerIds: string[];
    username: string;
    mapId: string;
}

async function fetchNFTs(
    wallet: string,
    refresh: boolean = false,
    downloadImages: boolean = false
) {
    let url = `${serverURL}/${wallet}/nfts`
    let separator = "?"

    if (refresh) {
        url += separator + "refresh=true"
        separator = "&"
    }

    if (downloadImages) {
        url += separator + "downloadImages=true"
    }

    try {
        const response = await axios.get(
            url,
            { headers: { "Authorization": `Basic ${authToken}` } }
        )
        return response.data.nfts
    } catch (err) {
        console.warn("Error while fetching NFTs", err)
        return []
    }
}

async function handleJoin(player: RpgPlayer, data: JoinMapData) {
    player.gui("login-screen").close();
    player.gui("loading-indicator").open();

    const mapId = data.mapId;
    const map = maps[mapId];

    // Set player data
    player.name = `${data.username} (${getFormattedAddress(data.playerAddress)})`;
    player.data.trainers = getTrainers(data.trainerIds)
    player.data.address = data.playerAddress;
    player.data.username = data.username;

    console.log("Player joined map", player.id, player.data.address, player.data.username)

    if (player.data.trainers) {
        player.data.activeTrainerIdx = 0
        player.setGraphic(`hero_${player.data.trainers[0].edition}`)
    } else {
        const characters = ["hero_0", "hero_4199", "hero_123", "hero_234", "hero_1337", "hero_999"];
        player.setGraphic(getRandomEntry(characters))
    }

    player.on("nftsAddedToSpritesheet", function (data: any[]) {
        if (!map.nftsAdded) {
            data.forEach(nft => {
                map.addEvent(nftEvent("nft_" + nft.index, nft.characterName, nft.text));
            });
            map.nftsAdded = true
        }

        player.changeMap(mapId, { x: 100, y: 700 });
    })

    player.on("refreshNfts", async () => {
        player.data.nfts = await fetchNFTs(player.data.address, true)
        player.data.party = player.data.nfts.slice(0, 3)
        player.emit("refreshNfts__completed", player.data.nfts)
    })

    player.on("winner", function(data){
        if (data.winner.name != "Tutorial Bot" && data.loser.name != "Tutorial Bot"){
            axios.post(
                serverURL + "/recordWinner",
                {
                    winner_address: data.winner.address,
                    loser_address: data.loser.address,
                    winner_username: data.winner.name,
                    loser_username:  data.loser.name,
                },
                { headers: { "Authorization": `Basic ${authToken}` } }
            ).then(async response => {
                console.log("winner: " + data.winner.name);
            });
        }
    });

    // Download NFTs for player
    const nfts = await fetchNFTs(data.playerAddress)
    player.data.nfts = nfts
    player.data.party = nfts.slice(0, 3)

    // Download NFTs for map
    // Temporary until we create public maps that aren't tied to addresses
    if (!downloadedNfts[mapId]) {
        var count = 0;
        // download NFTs and load them on map
        const mapNfts = await fetchNFTs(data.mapAddress)
        let nftEvents: any[] = []

        mapNfts.forEach((nft, idx) => {
            if (nft.image) {
                // add information about the nft
                var nftText = "This is " + nft.name + ". ";

                if (nft.attributes) {
                    nftText += "It has the following traits: ";

                    nft.attributes.forEach((attribute) => {
                        if (attribute.trait_type && attribute.value) {
                            nftText += attribute.trait_type
                            nftText += ": "
                            nftText += attribute.value + ". "
                        }
                    });
                }

                nftEvents.push({
                    characterName: 'nft_' + data.mapAddress + count,
                    graphicLink: nft.image,
                    index: idx,
                    text: nftText
                });

                count += 1;
            }
        });

        // Hack to make this compatible with large wallets?
        nftEvents = nftEvents.slice(0, 18)

        downloadedNfts[mapId] = nftEvents
        map.addEvent({ event: tutorialEvent(mapNfts), x: 50, y: 716 })

        player.emit("addNftsToSpritesheet", nftEvents);
    } else {
        player.emit("addNftsToSpritesheet", downloadedNfts[mapId]);
    }

    player.data.mapNfts = downloadedNfts[mapId]
}

@RpgModule<RpgServer>({
    player: {
        async onConnected(player: RpgPlayer) {
            console.log("Player connected", player.id)
            player.speed = 5;
            player.setHitbox(20, 16)
            // downloads and sets NFTs
            player.on("joinMap", async (data: JoinMapData) => await handleJoin(player, data));

            if (process.env.RPG_TYPE === "mmorpg" || process.env.RPG_TYPE == null) {
                player.gui("login-screen").open();
            } else {
                player.gui("loading-indicator").open();
            }
        },
        async onJoinMap(player, map) {
            console.log("onJoinMap called")

            player.on("gamePoints", function (data) {
                var numEXP = 0;
                if (data.game == "flappy"){
                    numEXP = data.score;
                } else if (data.game == "doodlejump"){
                    numEXP = data.score / 200;
                }

                if (data.score > 0) {
                    axios.post(
                        serverURL + "/nft/exp",
                        {
                            "nfts": [
                                {
                                    id: data.nftId,
                                    amount: numEXP
                                }
                            ]
                        },
                        { headers: { "Authorization": `Basic ${authToken}` } }
                    ).then(async response => {
                        player.showNotification(`You got ${numEXP} exp!`, {
                            time: 5000,
                            sound: undefined
                        })

                        const updatedNfts = {}

                        for (let nft of response.data.nfts) {
                            updatedNfts[nft._id] = nft
                        }

                        player.data.nfts = player.data.nfts.map(x => updatedNfts[x._id] || x)
                    });
                }
            });

            player.on("addExp", function(data) {
                axios.post(
                    serverURL + "/nft/exp",
                    data,
                    { headers: { "Authorization": `Basic ${authToken}` } }
                ).then(async response => {
                    const updatedNfts = {}

                    for (let nft of response.data.nfts) {
                        updatedNfts[nft._id] = nft
                    }

                    player.data.nfts = player.data.nfts.map(x => updatedNfts[x._id] || x)
                }); 
            })

            player.on("gameClosed", function() {
                player.data.inGame = false
            })


            player.showNotification('Welcome! To learn more about our game, chat with the guide on your left by walking up to him and pressing Enter or the A button.', {
                time: 6000,
                sound: undefined
            })
        },

        onDisconnected(player: RpgPlayer) {
            console.log("Player disconnected", player.id, player.name)
        }
    },
    maps: Object.values(maps)
})
export default class RpgServerModule { }