import { RpgClient, RpgModule } from '@rpgjs/client'
import BattleApp from './gui/BattleApp.vue'

@RpgModule<RpgClient>({ 
    gui: [
        BattleApp
    ],
})
export default class RpgClientEngine {}
