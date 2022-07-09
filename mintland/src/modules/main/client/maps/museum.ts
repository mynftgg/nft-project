import { Spritesheet } from '@rpgjs/client'

// needs to match tmx file name (hmm, but what if there are multiple?)

@Spritesheet({
    images: {
        '22_Museum_32x32': require('./assets/22_Museum_32x32.png'),
        'art_test': require('./assets/7_Art_32x32.png'),
        'Room Builder Main': require('./assets/Room_Builder_32x32.png'),
       'Museum_entrance_layer_1_32x32': require('./assets/museum/Museum_entrance_layer_1_32x32.png'),
       'Museum_entrance_layer_2_32x32': require('./assets/museum/Museum_entrance_layer_2_32x32.png'),
       'Museum_room_1_layer_1_32x32': require('./assets/museum/Museum_room_1_layer_1_32x32.png'),
       'Museum_room_1_layer_2_32x32': require('./assets/museum/Museum_room_1_layer_2_32x32.png'),
       'Museum_room_2_layer_1_32x32': require('./assets/museum/Museum_room_2_layer_1_32x32.png'),
       'Museum_room_2_layer_2_32x32': require('./assets/museum/Museum_room_2_layer_2_32x32.png'),
       'Museum_room_3_layer_1_32x32': require('./assets/museum/Museum_room_3_layer_1_32x32.png'),
       'Museum_room_3_layer_2_32x32': require('./assets/museum/Museum_room_3_layer_2_32x32.png'),
       'Museum_room_4_layer_1_32x32': require('./assets/museum/Museum_room_4_layer_1_32x32.png'),
       'Museum_room_4_layer_2_32x32': require('./assets/museum/Museum_room_4_layer_2_32x32.png'),
       'ThugSheet': require('./assets/ThugSheet.png'),
       'BirdSprite': require('./assets/BirdSprite.png'),
       'blind_hummingbird_spritesheet_16x16': require('./assets/blind_hummingbird_spritesheet_16x16.png'),
       'Museum_room_3_layer_2_32x32_rainbow': require('./assets/Museum_room_3_layer_2_32x32_rainbow.png'),
       'rainbow': require('./assets/rainbow.png'),
       'floor_rainbow': require('./assets/floor_rainbow.png'),
       'FinalMasterTilesetTransparent': require("./assets/MasterTilesetTransparentBackground.png"),
       'MasterTest': require("./assets/MasterTilesetTransparentBackground2.png"),
      'japan': require('./assets/Modern_Interiors/1_Interiors/32x32/Theme_Sorter_32x32/20_Japanese_interiors_32x32.png'),
      'MasterResizedTileset': require("./assets/MasterTilesetTransparentBackground4.png"),
    }
})
export class MuseumTilesets {

}