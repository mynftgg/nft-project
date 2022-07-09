import { Spritesheet, Animation } from '@rpgjs/client'

var defaultImage = require("./assets/default-nft.png"); 

@Spritesheet({
    id: 'nft', // id (mandatory)
    image: defaultImage,
    framesWidth: 1, // number of frames of the image across the width
    framesHeight: 1, // number of frames of the image across the height
    width: 52, // width of image
    height: 56, // height of image
    textures: {
        [Animation.Stand]: {
            animations: direction => [
                [{ time: 0, frameX: 0, frameY: 0 }]
            ]
        },
        [Animation.Walk]:  {
            animations: direction => [
                    [ 
                        { time: 0, frameX: 0, frameY: 0 },
                        { time: 10, frameX: 0, frameY: 0 },
                        { time: 20, frameX: 0, frameY: 0 }
                    ]
                ]
         }
    }
})
export class NFTCharacter {
    constructor(obj){
        obj && Object.assign(this, obj); 
    }
}
