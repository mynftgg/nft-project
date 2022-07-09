import { RpgMap, MapData } from '@rpgjs/server'

export function createDynamicMap(id: string, tmx_filename: string) {
    var mapData: any = {
        id: id,
        file: require(`./tmx/${tmx_filename}`),
        name: 'Town',
        events: [],
        sounds: []
    }

    @MapData(mapData)
    class DynamicMap extends RpgMap {
        static getEvents() {
            return mapData.events
        }

        static addEvent(event) {
            mapData.events.push(event)
        }

        static removeEvents() {
            mapData.events = []
        }
    }

    return DynamicMap;
}
