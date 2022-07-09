import { RpgClient, RpgModule } from '@rpgjs/client'
import menu from './gui/main.vue'

@RpgModule<RpgClient>({ 
    gui: [
        menu
    ]
})
export default class RpgClientEngine {}