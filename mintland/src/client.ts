import { entryPoint } from '@rpgjs/client'
import io from 'socket.io-client'
import globalConfig from './config/client'
import modules from './modules'; 

const fs = require('fs');
const http = require('https'); // or 'https' for https:// URLs
const folderRoot = "./src/modules/main/client/characters/assets/";

var axios = require('axios')

declare var window: any;

// const isPhantomInstalled = window.solana && window.solana.isPhantom
// console.log(isPhantomInstalled)
// console.log('is this thing on')

// if (isPhantomInstalled){
//     window.solana.connect()
//     window.solana.on("connect", () => 
//         console.log(
//             window.solana.publicKey.toString()
//         )
//     )
// }

// axios.get("https://arweave.net/J5bs7vD4abvw58KtuN7AqqKXRoZVVIA-b3JUnPgbZ4o").then(response =>
// {
//     console.log(response.data)

//     console.log(response.data.image);
//     const counter = 0;
    // can't call this from the client?
    // https://stackoverflow.com/questions/37569654/uncaught-typeerror-fs-createwritestream-is-not-a-function
    // const file = fs.createWriteStream("./src/modules/main/client/characters/assets/" + "nft_" + counter + ".png");

    // const request = http.get(response.data.image, function(response) {
    //     // downloads file
    //     response.pipe(file);
    //     console.log("downloaded");
    //     });

    // image
// })

// Get the Solana Address from the browser / connect
// Get all the arweave urls / jsons / data for each NFT in the wallet
// Store those urls in a variable or database (ex: localstorage?)
// Create a bunch of characters on the client side with empty/very small images
// in index.js on the server, download & replace the images (same files)

// Download and store the attributes for each in some persistent data store
// Download all the images
// Generate an NPC for each NFT. Set the NPC's attributes to the NFT's (need to create an NFT class in the database)
// Have the NPCs appear on the map. 

// ex: urls.forEach(url =>  const x = new NPC(url). map.add(x) );

// look into whether we can dynamically add to @Mapdata.events



document.addEventListener('DOMContentLoaded', function(e) { 
    entryPoint(modules, { 
        io,
        globalConfig,
        canvas: {
            transparent: true
        }
    }).start()
})