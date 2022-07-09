import { RpgClient, RpgModule } from '@rpgjs/client'
import Flappy from './gui/flappy.vue'

@RpgModule<RpgClient>({ 
    gui: [
        Flappy
    ]
})
export default class RpgClientEngine {}