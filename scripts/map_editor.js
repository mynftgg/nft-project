var convert = require('xml-js');
var fs = require('fs');
var xml = fs.readFileSync('map_template_to_edit.tmx', 'utf8');
var options = {ignoreComment: true, alwaysChildren: true};
var result = convert.xml2js(xml, options); // or convert.xml2json(xml, options)

var ref = result.elements[0];

var default_floor_tile = 244;

var enabled_layers = ['dummy'];

var floor_tile_list = [2015, 1004, 2676, 1927, 2247, 1411, 1791 ];


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }


  for (var i = 0; i<ref.elements.length; i++) {
    console.log(ref.elements[i]); 
  }


  // f1_f2_red
  // f2_blue

// iterate through all elements of map
for (var i = 0; i<ref.elements.length; i++) {
    if (ref.elements[i].name == "layer"){
        // turn room layers on and off
        if (ref.elements[i].attributes != null && ref.elements[i].attributes.name.includes("Room")) {
            if (ref.elements[i].attributes.name.includes("+1")) {
                var floor_name = ref.elements[i].attributes.name.replace("+1", "");
                // don't enable +1s for layers that don't exist
                if (!enabled_layers.includes(floor_name)){
                    ref.elements[i].elements = []
                }
            } 
            // randomly decide whether to remove a layer or not
            else if (getRandomInt(2) == 1) {
                // Remove the layer
                ref.elements[i].elements = []
            } else {
                enabled_layers.push(ref.elements[i].attributes.name);
            }
        }
        // change floor tile
        if (ref.elements[i].attributes != null && ref.elements[i].attributes.name.includes("Floor")) {
            var sub_elements = ref.elements[i].elements;
            var random_tile = floor_tile_list[getRandomInt(floor_tile_list.length)]

            for (var j = 0; j< sub_elements.length; j++) {
                sub_elements[j].elements[0].text = sub_elements[j].elements[0].text.toString().replace(new RegExp(default_floor_tile.toString(), 'g'), random_tile.toString())
            }
        }
    }
}

var options = {compact: false, ignoreComment: true, spaces: 4};

var convertedXML = convert.json2xml(result, options);

console.log(convertedXML);

fs.writeFile("/Users/zackkhan/Projects/personal/nft/nft-project/mintland/src/modules/main/server/maps/tmx/output2.tmx", convertedXML, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing TMX Map.");
        return console.log(err);
    }
 
    console.log("TMX file has been saved.");
});