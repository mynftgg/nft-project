import { RpgClient, RpgModule } from '@rpgjs/client'
import Doodle from './gui/doodlejump.vue'

@RpgModule<RpgClient>({ 
    gui: [
        Doodle
    ]
})
export default class RpgClientEngine {}