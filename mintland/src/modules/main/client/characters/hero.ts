import { Spritesheet, Animation, Direction } from '@rpgjs/client'

const frameX = (direction) => {
    return {
        [Direction.Right]: 0, 
        [Direction.Up]: 1,
        [Direction.Left]: 2,
        [Direction.Down]: 3,
    }[direction]
}

export function getSpritesheetUrl(id) {
    return `https://mynftgg.s3.amazonaws.com/sprites/mint/${id}.png`
}

function getAllSpritesheets() {
    const spritesheets = {}

    for (let i = 0; i < 4200; ++i) {
        const spriteId = `hero_${i}`
        spritesheets[spriteId] = (getSpritesheetUrl(i))
    }

    return spritesheets
}

@Spritesheet({
    id: "hero", // id (mandatory)
    images: getAllSpritesheets(),
    framesWidth: 24, // number of frames of the image across the width
    framesHeight: 3, // number of frames of the image across the height
    width: 768, // width of image
    height: 144, // height of image
    textures: {
        [Animation.Stand]: {
            animations: direction => [
                [{ time: 0, frameX: frameX(direction), frameY: 0 }]
            ]
        },
        [Animation.Walk]:  {
            animations: direction => [
                [ 
                    { time: 0, frameX: frameX(direction) * 6, frameY: 2 },
                    { time: 5, frameX: frameX(direction) * 6 + 1, frameY: 2 },
                    { time: 10, frameX: frameX(direction) * 6 + 2, frameY: 2 },
                    { time: 15, frameX: frameX(direction) * 6 + 3, frameY: 2 },
                    { time: 20, frameX: frameX(direction) * 6 + 4, frameY: 2 },
                    { time: 25, frameX: frameX(direction) * 6 + 5, frameY: 2 },
                ]
            ]
        }
    }
})
export class HeroCharacter {}
