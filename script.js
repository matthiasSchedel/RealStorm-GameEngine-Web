/*
* @Author: Matthias Schedel
* @Mail: matze.schedel@gmail.com
*/

var id_ = function (i) { return document.getElementById(i); }
var class_ = function (c) { return document.getElementsByClassName(c)[0]; }

var RealStormEngine =
    {
        SelectedGameObject:null,
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
    constructor(transform, name, id, x, y) {
        
        //var o = new GameObject(g.el,g.name,RealStormEngine.my_gameObjects.length,0,0);
        //RealStormEngine.my_gameObjects.push(o);
        //
        //console.log("tf",transform);
        this.SetName(name);
        this.name = name;
        //this.SetTransform(transform);
        this.SetId(id);
        this.layer = 1;
        this.x = 0;
        this.y = 0;
        this.order = id;
        

        //this.Transform(x,y);
    }
    Duplicate() {

    }
    Delete() {

    }
    Reset() { this.Transform(0,0) }
    Transform(x,y) {
        this.x = x;
        this.y = y;
        id_('group_'+this.id).setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
        // 3,4,5,6
        var toChange = id_('object_'+this.id).childNodes;
        //console.log('check',toChange);
        toChange[5].value = x;
        toChange[6].value = x;
        toChange[8].value = y;
        toChange[9].value = y;

    }
    GetX() { return this.x; }
    SetX(value) { this.Transform(value,this.y); }
    GetY() { return this.y; }
    SetY(value) { this.Transform(this.x,value); }
    GetId() { return this.id; }
    SetId(value) { this.id = value; }
    GetTransform() { return this.transform; }
    SetTransform(value) { this.transform = value; }
    GetName() { return this.name; }
    SetName(value) { this.name = value; }
    GetLayer() {return this.layer;}
    SetLayer(value) { 
        //if (this.layer == value) return;
        //RealStormEngine.Layers[this.layer - 1][this.id] = null;
        this.layer = parseInt(value); 
        //RealStormEngine.Layers[this.layer - 1][this.id] = this.name;
        //console.log('layers',RealStormEngine.Layers);
        RealStormEngine.UpdateLayers();
    }
}
Run = function()
{
    //var a = new GameObject('my_name',1,0,0);
    //console.log("go",a);
    //console.log('name',a.GetName());
}



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
    if (PixelEditor.leftmousedown) c.style.background = PixelEditor.selectedColor;
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

PixelEditor.CreateObject2 = function (a) {
    var g =
        {
            el: document.getElementById('pixel_canvas').innerHTML,
            name: (id_('object_name').value + (RealStormEngine.gameObjects.length))
        };
        // transform, id, x, y 
       RealStormEngine.SelectedGameObject = new GameObject(g.el,g.name,RealStormEngine.my_gameObjects.length,0,0);
       RealStormEngine.my_gameObjects.push(RealStormEngine.SelectedGameObject);
       PixelEditor.CreateObjectFromCanvas(g.el,g.name,RealStormEngine.my_gameObjects.length-1);
    //PixelEditor.CreateObjectFromCanvas(g);
}

PixelEditor.CreateTransform = function(id)
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
PixelEditor.CreateListElement = function(name,id)
{
    console.log("Id",id);
    var l = document.createElement('li')
    l.setAttribute('id', 'object_' + id);
    l.innerHTML = RealStormEngine.AddInputHandler2(name, id);
    id_("object_list").appendChild(l);
}

RealStormEngine.OnObjectClick = function(ev)
{
    console.log("test");
}
PixelEditor.CreateObjectFromCanvas = function (tf, name,id) {
    //var id = RealStormEngine.gameObjects.length;
    var g = PixelEditor.CreateTransform(id);
    console.log("r_o",RealStormEngine.my_gameObjects)
    
    PixelEditor.CreateListElement(name,id);
    //group_id, id, name, x, y, list_id, 
    //var x = new GameObject();
    //RealStormEngine.gameObjects.push(g);
    RealStormEngine.editor.my_svg.appendChild(g);
    //RealStormEngine.my_gameObjects.push(RealStormEngine.SelectedGameObject);
    //console.log("obj",RealStormEngine.my_gameObjects);
    id_('group_' + id).addEventListener('onclick', RealStormEngine.OnObjectClick);
    //id_('layer_2').appendChild(g);
    //var id = RealStormEngine.gameObjects.length - 1;
    
    RealStormEngine.editor.my_svg.innerHTML += "";
    //RealStormEngine.my_gameObjects[id].SetTransform(g);

}

RealStormEngine.UpdateLayers = function()
{
    //var first = my_svg.removeChild(my_svg.childNodes[0]);
     //   my_svg.appendChild(first);
        
        
    var nodes = [];
    var setLayer = 0;
    for (var i = 2; i < 4; i++) {
        for(var j = 0;j < RealStormEngine.my_gameObjects.length;j++)
        {   
            var g = RealStormEngine.my_gameObjects[j];
            //console.log("layer",RealStormEngine.my_gameObjects, g.layer);
            if (g.layer == i) 
            {
                //console.log("id:",g.id,"order",g.order)
                 var first = my_svg.removeChild(my_svg.childNodes[g.id]);
                 my_svg.appendChild(first);
                 my_svg.innerHTML += "";
            }
        }
    }   
    my_svg.innerHTML += "";
    console.log(my_svg.childNodes);
    for (i = 0; i < my_svg.childNodes.length;i++)
    {
        console.log(my_svg.childNodes[i].id);
        //console.log();
        RealStormEngine.my_gameObjects[my_svg.childNodes[i].id.substring(6,my_svg.childNodes[i].id.length)].order = i;
    }
    //my_svg.childNodes = [];
    /*while(nodes.length > 0)
        {   
            my_svg.childNodes.appendChild(n.pop());
        }
    my_svg.innerHTML += "";*/
    //nodes = [];
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
        var first = my_svg.removeChild(my_svg.childNodes[0]);
        my_svg.appendChild(first);
        my_svg.innerHTML += "";
    }
}

RealStormEngine.AddInputHandler2 = function (name, i) {
    return name + '<button class="gameObject" onclick="RealStormEngine.DeleteObject(' + i + ')">X</button>' +
        '<button class="gameObject" onclick="RealStormEngine.DuplicateObject(' + i + ')">D</button>' +
        '<button class="gameObject" onclick="RealStormEngine.ResetObject(' + i + ')">R</button>' +
        ' - x:<input value="' + (this.value || 0) + '" onchange="RealStormEngine.TransformX(' + i + ',this.value)" type="value" />' + '<input onmousemove="RealStormEngine.TransformX(' + i + ',this.value)" value="0" min="-600" max="1200" type="range"/>' +
        'y:<input value="' + (this.value || 0.0) + '" onchange="RealStormEngine.TransformY(' + i + ',this.value)" type="value" />' + '<input onmousemove="RealStormEngine.TransformY(' + i + ',this.value)" value="0" min="-600" max="1200" type="range"/>'
        + 'layer:<select onchange="RealStormEngine.ChangeLayer(' + i + ',this.value)"> <option>1</option><option>2</option> <option>3</option></select>'
}
RealStormEngine.ChangeLayer = function (i,layer) {
    //console.log("change layer", );
    RealStormEngine.my_gameObjects[i].SetLayer(layer);

}
RealStormEngine.DuplicateObject = function (i) {
    console.log("Reset Object",i);

}
RealStormEngine.DuplicateObject = function (i) {
    var toDup = RealStormEngine.my_gameObjects[i];
    var l = document.createElement('li')
    l.setAttribute('id', 'object_' + RealStormEngine.my_gameObjects.length);
    //l.innerHTML = RealStormEngine.AddInputHandler2("duplicate", RealStormEngine.gameObjects.length);
    l.innerHTML = RealStormEngine.AddInputHandler2(toDup.GetName(), RealStormEngine.my_gameObjects.length);
    id_("object_list").appendChild(l);
    var g = id_('group_'+i).cloneNode(true);
    g.setAttribute('id', 'group_' + RealStormEngine.my_gameObjects.length);
    
    var o = new GameObject(g,toDup.GetName, RealStormEngine.my_gameObjects.length,0,0);
    RealStormEngine.my_gameObjects.push(o);
    my_svg.appendChild(g);
    RealStormEngine.editor.my_svg.innerHTML += "";
}
RealStormEngine.TransformX = function (i, x) {
    console.log('obj',RealStormEngine.my_gameObjects,'i',i);
    RealStormEngine.my_gameObjects[i].SetX(x);
    /*var y = 0;
    if (id_('group_' + i).getAttribute('transform')) {
        y = id_('group_' + i).getAttribute('transform').split(',')[1].split(')')[0];
        //console.log("y->", y);
    }
    */
    //id_('group_' + i).setAttribute('transform', 'translate(' + x + ',' + y + ')');
}
RealStormEngine.ResetObject = function(i)
{
    RealStormEngine.my_gameObjects[i].Reset();
}
RealStormEngine.TransformY = function (i, y) {
    RealStormEngine.my_gameObjects[i].SetY(y);
    /* var x = 0;
    if (id_('group_' + i).getAttribute('transform')) {
        x = id_('group_' + i).getAttribute('transform').split('(')[1].split(',')[0];
        //console.log("x->", x);
    }
    id_('group_' + i).setAttribute('transform', 'translate(' + x + ',' + y + ')');*/
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