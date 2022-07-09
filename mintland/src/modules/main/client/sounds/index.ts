import { Sound } from '@rpgjs/client'

@Sound({
    sounds: {
        town: require('./assets/Town_Theme.ogg'),
    },
    loop: true,
    volume: 0.0
})
export class Musics {}

@Sound({
    sounds: {
        chest: require('./assets/doorOpen_1.ogg'),
    }
})
export class Sounds {}