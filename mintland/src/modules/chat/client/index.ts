import { RpgClient, RpgModule } from '@rpgjs/client'
import chatGui from './gui/chat.vue'
import { sceneMap } from './map'

@RpgModule<RpgClient>({
    scenes: {
        map: sceneMap
    },
    gui: [
        chatGui
    ]
})
export default class RpgClientEngine {}