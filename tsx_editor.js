var objCounter = 10;
var string = "";
//1948
for (var i = 0; i<1; i++){
    var title_start = `<tile id="${i}">`
    string += title_start;

    var object_group = `<objectgroup draworder="index" id="2">`;
    string += object_group;

    var object_tag = `<object id="${objCounter}" x="-2.15989" y="-33.9412" width="0.308556" height="0.308556"/> `
    string += object_tag;

    string += "</objectgroup>"
    string += "</tile>"
    objCounter++;
}

console.log(string)

{/* <tile id="144">
<objectgroup draworder="index" id="2">
 <object id="3" x="-2.15989" y="-33.9412" width="0.308556" height="0.308556"/>
 <object id="4" x="1.41233" y="-43.7822" width="73.4411" height="78.3843"/>
</objectgroup>
</tile> */}

