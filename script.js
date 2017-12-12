/*
* @Author: Matthias Schedel
* @Mail: matze.schedel@gmail.com
*/

var RealStormEngine =
    {
        gameObjects: [],
        my_gameObjects: [],
        debug: false,
        foreGround: true,
        CreateNewImage: null,
        selectedElem: null,
        selectedElemId: '',
        editor: null,
        Layers:[
            [],
            [],
            []
        ],
        list: null
    }

var PixelEditor = 
{
    foreGround: true,
    selectedBackgroundColor: 'white',
    selectedColor: 'green',
    leftmousedown: false,
    rightmousedown: false,
    altkeydown: false,
    colors: [
        '#d6a090',
        '#fe3b1e',
        '#a12c32',
        '#fa2f7a',
        '#fb9fda',
        '#e61cf7',
        '#992f7c',
        '#47011f',
        '#051155',
        '#4f02ec',
        '#2d69cb',
        '#00a6ee',
        '#6febff',
        '#08a29a',
        '#2a666a',
        '#063619',
        '#000000',
        '#4a4957',
        '#8e7ba4',
        '#b7c0ff',
        '#ffffff',
        '#acbe9c',
        '#827c70',
        '#5a3b1c',
        '#ae6507',
        '#f7aa30',
        '#f4ea5c',
        '#9b9500',
        '#566204',
        '#11963b',
        '#51e113',
        '#08fdcc'
    ]
}

class GameObject {
    constructor(name, layer, x, y) {
        this.SetName(name);
        this.layer = layer;
        this.x = x;
        this.y = y;
    }
    Duplicate() {

    }
    Delete() {

    }
    Transform(x,y) {
        this.x += x;
        this.y += y;
    }

    GetName() { return this.name; }
    SetName(value) { this.name = value; }
    GetLayer() { return this.layer; }
    SetLayer(value) { this.layer = value; }
}
Run = function()
{
    var a = new GameObject('my_name',1,0,0);
    console.log("go",a);
    console.log('name',a.GetName());
}

id_ = function (i) { return document.getElementById(i); }
class_ = function (c) { return document.getElementsByClassName(c)[0]; }

PixelEditor.SetSelected = function (s) {
    console.log("set ", s);
    id_('selected_pixel').style.background = s;
    PixelEditor.selectedColor = s;
}
PixelEditor.ClickColor = function (c) {
    console.log("color", PixelEditor.strgkeydown);
    if (PixelEditor.altkeydown) { PixelEditor.SetSelected(c.style.background); }
    else if (c.style.background == PixelEditor.selectedColor) { c.style.background = 'white'; }
    else { c.style.background = PixelEditor.selectedColor; }
}

PixelEditor.ApplyColor = function (c) {
    //console.log("color",c);
    //c.style.fill = 'blue';
    //c.style.color = 'red';
    /*if (PixelEditor.rightmousedown) { c.style.background = 'white'; }
    else */if (PixelEditor.leftmousedown) c.style.background = PixelEditor.selectedColor;

}
PixelEditor.CreateObject2 = function (a) {
    var g =
        {
            el: document.getElementById('pixel_canvas').innerHTML,
            name: (id_('object_name').value + (RealStormEngine.gameObjects.length + 1))
        };
    PixelEditor.CreateObjectFromCanvas(g);
}
PixelEditor.CreateNewImage = function (sel, width, height) {
    var ppc = id_(sel);
    var image = "";
    var c = 0;
    for (var i = 0; i < height; i++) {
        image += "<div class='pixel_row'>";
        for (var j = 0; j < width; j++) {
            var style = "";
            if (sel == "color_palette" && i + j < PixelEditor.colors.length) {
                style += "style='background:" + PixelEditor.colors[c++] + "'";
            }
            image += "<div class='pixel' onmouseenter='PixelEditor.ApplyColor(this)'" + style + " onclick='PixelEditor.ClickColor(this);'></div>";
        }
        image += "</div>";
    }
    ppc.innerHTML = image;
}

PixelEditor.CreateTransform = function(o,id)
{
    var p = document.getElementById('pixel_canvas');
    var g = document.createElementNS(my_svg, "g");
    g.setAttribute('id', 'group_' + id);
    g.setAttribute('shape-rendering', 'inherit');
    g.setAttribute('pointer-events', 'all');
    for (var i = 0; i < p.childNodes.length; i++) {
        pi = p.childNodes[i];
        for (var j = 0; j < pi.childNodes.length; j++) {
            RealStormEngine.CreateRect(g, pi.childNodes[j].style.background, j * 10, i * 10)//);
        }
    }
    return g;
}
PixelEditor.CreateListElement = function(o)
{
    var l = document.createElement('li')
    l.setAttribute('id', 'object_' + RealStormEngine.gameObjects.length);
    l.innerHTML = RealStormEngine.AddInputHandler2(o.name, RealStormEngine.gameObjects.length);
    id_("object_list").appendChild(l);
}

RealStormEngine.OnObjectClick = function(ev)
{
    console.log("test");
}
PixelEditor.CreateObjectFromCanvas = function pixels(o) {
    var id = RealStormEngine.gameObjects.length;
    var g = PixelEditor.CreateTransform(o,id);
    PixelEditor.CreateListElement(o);
    //group_id, id, name, x, y, list_id, 
    var x = new GameObject();
    RealStormEngine.gameObjects.push(g);
    RealStormEngine.editor.my_svg.appendChild(g);
    id_('group_' + id).addEventListener('onclick', RealStormEngine.OnObjectClick);
    //id_('layer_2').appendChild(g);
    var id = RealStormEngine.gameObjects.length - 1;
    
    RealStormEngine.editor.my_svg.innerHTML += "";

}

RealStormEngine.UpdateLayers = function()
{
    
}




var my_svg = id_("my_svg");
RealStormEngine.editor = {
    mode: 1,
    width: 640,
    height: 640,
    svg: my_svg

};
RealStormEngine.editor.my_svg = id_("my_svg");

RealStormEngine.DeleteObject = function (i) {
    var elem = id_('object_' + i);
    elem.parentNode.removeChild(elem);
    var elem2 = id_('group_' + i);
    elem2.parentNode.removeChild(elem2);
    my_svg.innerHTML += "";
}

RealStormEngine.Click = function (i) {
    if (i.originalTarget.localName == 'rect') {
        console.log(i.originalTarget.parentNode);
        //i.originalTarget.parentNode.setAttributeNS(null, 'z-index', 0);
        //i.originalTarget.parentNode.setAttribute('z-index', 0);
        var first = my_svg.removeChild(my_svg.childNodes[0]);
        my_svg.appendChild(first);
        my_svg.innerHTML += "";
    }
}

RealStormEngine.AddInputHandler2 = function (name, i) {
    return name + '<button class="gameObject" onclick="RealStormEngine.DeleteObject(' + i + ')">X</button>' +
        '<button class="gameObject" onclick="RealStormEngine.DuplicateObject(' + i + ')">D</button>' +
        ' - x:<input value="' + (this.value || 0) + '" onchange="RealStormEngine.TransformX(' + i + ',this.value)" type="value" />' + '<input onmousemove="RealStormEngine.TransformX(' + i + ',this.value)" value="0" min="0" max="600" type="range"/>' +
        'y:<input value="' + (this.value || 0.0) + '" onchange="RealStormEngine.TransformY(' + i + ',this.value)" type="value" />' + '<input onmousemove="RealStormEngine.TransformY(' + i + ',this.value)" value="0" min="0" max="600" type="range"/>'
        + 'layer:<select onchange="RealStormEngine.ChangeLayer(this)"> <option>1</option><option>2</option> <option>3</option></select>'
}
RealStormEngine.ChangeLayer = function (evt) {
    console.log("change layer", evt);
}
RealStormEngine.DuplicateObject = function (i) {
    var l = document.createElement('li')
    l.setAttribute('id', 'object_' + RealStormEngine.gameObjects.length);
    l.innerHTML = RealStormEngine.AddInputHandler2("duplicate", RealStormEngine.gameObjects.length);
    id_("object_list").appendChild(l);
    var g = RealStormEngine.gameObjects[i].cloneNode(true);
    g.setAttribute('id', 'group_' + RealStormEngine.gameObjects.length);
    RealStormEngine.gameObjects.push(g);
    my_svg.appendChild(g);
    RealStormEngine.editor.my_svg.innerHTML += "";
}
RealStormEngine.TransformX = function (i, x) {
    var y = 0;
    if (id_('group_' + i).getAttribute('transform')) {
        y = id_('group_' + i).getAttribute('transform').split(',')[1].split(')')[0];
        console.log("y->", y);
    }
    id_('group_' + i).setAttribute('transform', 'translate(' + x + ',' + y + ')');
}
RealStormEngine.TransformY = function (i, y) {
    var x = 0;
    if (id_('group_' + i).getAttribute('transform')) {
        x = id_('group_' + i).getAttribute('transform').split('(')[1].split(',')[0];
        console.log("x->", x);
    }
    id_('group_' + i).setAttribute('transform', 'translate(' + x + ',' + y + ')');
}
RealStormEngine.CreateRect = function (g, color, x, y) {
    color = color || 'white';
    var cs = color.toString().split(" ");
    var c = (cs.length > 0) ? cs[0] : 'white';
    var rect = document.createElementNS(RealStormEngine.editor.my_svg, 'rect');
    rect.setAttributeNS(null, 'x', x);
    rect.setAttributeNS(null, 'y', y);
    if (c == 'white') rect.setAttributeNS(null, "fill-opacity", 0);
    if (c.includes('rgb')) { c = cs[0] + cs[1] + cs[2]; }
    rect.setAttributeNS(null, 'height', 10);
    rect.setAttributeNS(null, 'width', 10);
    rect.setAttribute('pointer-events', 'inherit');
    rect.setAttributeNS(null, 'fill', c.toString());
    g.appendChild(rect);
}
//#BEGIN REGION keys
with(window) {
    onload = function (e) {
        PixelEditor.CreateNewImage("pixel_canvas", 8, 8);
        PixelEditor.CreateNewImage("color_palette", 8, 8);
        id_('selected_pixel').style.background = PixelEditor.selectedColor;
        id_('selected_background_pixel').style.background = PixelEditor.selectedBackgroundColor;
    }
    onkeydown = function (e) {
        if (e.keyCode == 18) PixelEditor.altkeydown = true;
    }
    onkeyup = function (e) {
        if (e.keyCode == 18) PixelEditor.altkeydown = false;
    }
    onmousedown = function (e) {
        if (e.button == 0) PixelEditor.leftmousedown = true;
        if (e.button == 2) PixelEditor.rightmousedown = true;
    }
    onmouseup = function (e) {
        if (e.button == 0) PixelEditor.leftmousedown = false;
        if (e.button == 2) PixelEditor.rightmousedown = false;
    }
}
Run();