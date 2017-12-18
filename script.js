/*
* @Author: Matthias Schedel
* @Mail: matze.schedel@gmail.com
*/

var id_ = function (i) { return document.getElementById(i); }
var class_ = function (c) { return document.getElementsByClassName(c)[0]; }
var player = null;
var player_object = 
{
    animations:{
    idle:[],
    walking:[],
    jumping:[]
    },
    max_health:100,
    curr_health:100

};
var lastMove = 37;
var projectile = null;
var projectiles = [];
var Load = function()
{
 if (localStorage.key('test'))
    {
        console.log('object does exist')
        var obj = JSON.parse(localStorage.getItem('test'));
    } else 
    {
        console.log('object does not exist')
        localStorage.setItem('test', JSON.stringify({"name":"test"}));
    }
}

var SaveScene = function(scene_name)
{
    localStorage.setItem(scene_name, JSON.stringify(
        {
        "svg":id_('my_svg').innerHTML,
        "list":id_('object_list').innerHTML,
        "gameObjects":RealStormEngine.my_gameObjects,
        "script":id_('cnsl').value.toString()
    }
    ));
}
var LoadScene = function(scene_name)
{
    if (localStorage.key(scene_name)) 
    {
        id_('cnsl').value = JSON.parse(localStorage.getItem(scene_name)).script;
        id_('my_svg').innerHTML = JSON.parse(localStorage.getItem(scene_name)).svg;
        id_('object_list').innerHTML = JSON.parse(localStorage.getItem(scene_name)).list;
        RealStormEngine.my_gameObjects = JSON.parse(localStorage.getItem(scene_name)).gameObjects;
        
    }
}

var SaveObject = function(object_name)
{
    localStorage.setItem(object_name, JSON.stringify({"value":id_('pixel_canvas').innerHTML}));
}
var LoadObject = function(object_name)
{
    if (localStorage.key(object_name)) id_('pixel_canvas').innerHTML = JSON.parse(localStorage.getItem(object_name)).value;
}

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


function run() {
    var el = document.getElementById('cnsl');
    var scriptText = el.value;
    var oldScript = document.getElementById('scriptContainer');
    var newScript;

    if (oldScript) {
      oldScript.parentNode.removeChild(oldScript);
    }
    newScript = document.createElement('script');
    newScript.id = 'scriptContainer';
    newScript.text = el.value;
    document.body.appendChild(newScript);
} 

class GameObject {
    constructor(transform, name, id, x, y) {
        this.SetName(name);
        this.name = name;
        this.SetId(id);
        this.layer = 1;
        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.order = id;
    }
    Duplicate() {

    }
    Scale(x,y)
    {
        this.scaleX = x;
        this.scaleY = y;
        id_('group_'+this.id).setAttribute('transform', 'translate(' + this.x + ',' + this.y + ') scale('+this.scaleX+','+this.scaleY+')');
    }
    Delete() {
        var elem = id_('object_' + this.id);
        elem.parentNode.removeChild(elem);
        var elem2 = id_('group_' + this.id);
        elem2.parentNode.removeChild(elem2);
        //RealStormEngine.my_gameObjects.splice(index, 1);
        my_svg.innerHTML += "";
    }
    Reset() { this.Transform(0,0) }
    Transform(x,y) {
        this.x = x;
        this.y = y;
        id_('group_'+this.id).setAttribute('transform', 'translate(' + this.x + ',' + this.y + ') scale('+this.scaleX+','+this.scaleY+')');
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
        this.layer = parseInt(value); 
        RealStormEngine.UpdateLayers();
    }
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
            name: (id_('object_name').value + (RealStormEngine.my_gameObjects.length))
        };
        // transform, id, x, y 
       
       RealStormEngine.my_gameObjects.push(new GameObject(g.el,g.name,RealStormEngine.my_gameObjects.length,0,0));
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
    var g = PixelEditor.CreateTransform(id);
    console.log("r_o",RealStormEngine.my_gameObjects)
    
    PixelEditor.CreateListElement(name,id);
    RealStormEngine.editor.my_svg.appendChild(g);
    id_('group_' + id).addEventListener('onclick', RealStormEngine.OnObjectClick);
    RealStormEngine.editor.my_svg.innerHTML += "";
}

RealStormEngine.UpdateLayers = function()
{
    var nodes = [];
    var setLayer = 0;
    for (var i = 2; i < 4; i++) {
        for(var j = 0;j < RealStormEngine.my_gameObjects.length;j++)
        {   
            var g = RealStormEngine.my_gameObjects[j];
            if (g.layer == i) 
            {
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
        RealStormEngine.my_gameObjects[my_svg.childNodes[i].id.substring(6,my_svg.childNodes[i].id.length)].order = i;
    }
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
    RealStormEngine.my_gameObjects[i].Delete();
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
    RealStormEngine.my_gameObjects[i].SetLayer(layer);

}
RealStormEngine.DuplicateObject = function (i) {
    console.log("Reset Object",i);

}
RealStormEngine.DuplicateObject = function (i) {
    var toDup = RealStormEngine.my_gameObjects[i];
    var l = document.createElement('li')
    l.setAttribute('id', 'object_' + RealStormEngine.my_gameObjects.length);
    l.innerHTML = RealStormEngine.AddInputHandler2(toDup.GetName(), RealStormEngine.my_gameObjects.length);
    id_("object_list").appendChild(l);
    var g = id_('group_'+i).cloneNode(true);
    g.setAttribute('id', 'group_' + RealStormEngine.my_gameObjects.length);
    var o = new GameObject(g,toDup.GetName, RealStormEngine.my_gameObjects.length,0,0);
    RealStormEngine.my_gameObjects.push(o);
    my_svg.appendChild(g);
    RealStormEngine.editor.my_svg.innerHTML += "";
    return o;
}
RealStormEngine.TransformX = function (i, x) {
    console.log('obj',RealStormEngine.my_gameObjects,'i',i);
    RealStormEngine.my_gameObjects[i].SetX(x);
}
RealStormEngine.ResetObject = function(i)
{
    RealStormEngine.my_gameObjects[i].Reset();
}
RealStormEngine.TransformY = function (i, y) {
    RealStormEngine.my_gameObjects[i].SetY(y);
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

var fire = function(direction) 
{
    PlaySound('shoot');
    var proj = RealStormEngine.DuplicateObject(1);
    proj.Transform(player.GetX(),player.GetY());
    if (player.scaleX == -1) proj.Transform(proj.x-70,proj.y);
    var move = {x:0,y:0};
        if (direction == 37) {move.x=-10; }
        else if (direction == 39) {move.x=10;  }
        else if (direction == 38) {move.y=-10; }
        else if (direction == 40) { move.y=10;  }
    
    projectiles.push({move:move,p:proj});
}
var playerSet = 
{
    acceleration:0,
    gravity:0.91,
    jumpPower:-13,
    moveSpeed:10,
    dir:0
};

Distance = function(obj1, obj2)
{
    //console.log("obj1",obj1.x,"obj2",obj2.x);
    var a = obj1.x - obj2.x;
    var b = obj1.y- obj2.y;
    var c = Math.sqrt( a*a + b*b );
    //console.log("distance",c);
    return c;
}
Update = function()
{
    if (player) {
    if(player.y < 500)
    {
        playerSet.acceleration += playerSet.gravity;
    } else 
    {
        player.Transform(player.x,500);
        playerSet.acceleration = 0;

    }
    if (playerSet.dir == 37) { player.SetX(player.x-2*playerSet.moveSpeed); }
    else if (playerSet.dir == 39) { player.SetX(player.x+2*playerSet.moveSpeed); }
    player.Transform(player.x,player.y + playerSet.acceleration);
    
    projectiles.forEach(function(e) { e.p.Transform((e.move.x == 0) ? e.p.x : e.p.x + e.move.x,(e.move.y == 0) ? e.p.y : e.p.y + e.move.y)});
    projectiles.forEach( function(e, index, object) { if(Distance(e.p,player) > 800) { e.p.Delete(); object.splice(index, 1);} });

}
}
var Flip = function()
{
    player.Scale(player.scaleX *= -1, player.scaleY); player.Transform(player.x - player.scaleX*40,player.y);
}

var Jump = function(e)
{
    PlaySound('jump');
    e.preventDefault(); 
    player.Transform(player.x,player.y - 2); 
    playerSet.acceleration = playerSet.jumpPower;
    //console.log("set",playerSet.acceleration); 
    /* player.SetY(player.y+10); lastMove = 40;*/ 
}
with(window) {
    onload = function (e) {
        PixelEditor.CreateNewImage("pixel_canvas", 8, 8);
        PixelEditor.CreateNewImage("color_palette", 8, 8);
        id_('selected_pixel').style.background = PixelEditor.selectedColor;
        id_('selected_background_pixel').style.background = PixelEditor.selectedBackgroundColor;
    }
    onkeydown = function (e) {
        if (player) 
        {
            console.log("key:",e.keyCode);
            if (e.keyCode == 37 && playerSet.dir == 0) { if(player.scaleX == 1) {Flip();};playerSet.dir = 37; lastMove = 37; }
            else if (e.keyCode == 39 && playerSet.dir == 0) { if(player.scaleX == -1) {Flip();};playerSet.dir = 39; lastMove = 39; }
            if (e.keyCode == 38) { }
            if (e.keyCode == 38 && player.y == 500) { Jump(e); }
            if (e.keyCode == 40)
            {
                e.preventDefault();
                fire(lastMove);
            }
        }
        if (e.keyCode == 18) PixelEditor.altkeydown = true;
    }
    onkeyup = function (e) {
        if (e.keyCode == 37 && playerSet.dir == 37) { playerSet.dir =0; }
        else if (e.keyCode == 39 && playerSet.dir == 39) { playerSet.dir =0; }
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
function PlaySound(soundtype) {
    var snd = new  Audio("data:audio/mp3;base64,"+sounds[soundtype]);
    snd.volume = 0.3;
    snd.play();
}
const sounds =
{
    shoot:"/+MYxAANAPraUUEwAHFCgAKeA//GYxjfkAHGNj8H4xjAAAAAwX4IEAgggUBAEAQDD//VLn/5R3BAEHf//VrB/B+KNSAXP/8//+MYxAcNsOb8yYF4APt//zT5v63T43zcvZDErGqWxneiKVf+nIkT//Ll22/rflxOSPZcgEnqBAFj3WW0qQAHSBZEAP///+o0/+MYxAsOSX8KWc0QASTC1hawq4xgkAW8mlRmSpwvF4vJN/////T6TyMoIgAQQZtxZHBXAxINNeGKfJKqA/jH/owA//1MqxmQ/+MYxAwOWUNGWVBIAjELhb+Fh5wqG5WJku62/+p//////xRAgQEAoYLiRU2QF0RKiBUidDolBqn//VX/QQQN1m4DPJBY0Aym/+MYxA0PybrsAY04ACkA7CCYPmLdBPT/o3cIBWw3B2pFMH5ZfuzLp+0xj9TyA+ZSYhEz8eO8pxzajDOeFf/0KgQq4km3IP/K/+MYxAgNKHr2WcIQAlKXMYBL7IYpQoKgqCoNA0DQNLBWDQNAqCv/iIGTsse//BoGf/g0DQKu//1A1UxBTUUzLjk5LjVVVVVV",
    jump:"/+MYxAAMUI7YUUMQAFITT93d3NERERPN3d3/3DgYGBi3An8Tg4CAIBiCBT/5Q5/8QA+//+sH3//E59b//wQVLOWcs9dL/MhH/+MYxAkOKir4AY04AJSSixLmiGRv//0PFn8Mn/QXp/NLf8//3/lH/9Bs3/qLD+t/U+zqDch6OTOf4k9/WoGBAwRBtR////1G/+MYxAsPmg7tGc0oAEO4ZQLAlGrV///6lAUGBDiQov///8zggfD4ov///oZxIeKCYuD7//LBUyR//LBISExAZRWD+vhMRyMO/+MYxAcOCZsmWDgFIv/++3b6WCIAcaMAAART///9DhsOkz3/6PCjCwQOf/iUBC45z//KgqkyR/+Sg0LCw00qcAywaoIIXoB0/+MYxAkPgj8DGUoQAO//+lZ1Ua3NFUQguMb97fT/65RIJSN////1LUSYn////qUpSDiBI7/6BKdCoqf/+p6w0DIEIK+p///7/+MYxAYNYnq4AZFQABmBXazLwLRbMcyROb/2WeYEoCUefT/7P+JX//+Fyjf2Fr/6//j8an/5oyLt//9pakxBTUUzLjk5LjWq/+MYxAsAAANIAcAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
    coin:"/+MYxAAM4AL+WUEYApJJIw7dQAfB8HwfAgIAgCBxYPg+flAQDGJwf+D+CAIYPn/g4GMQA+/AjuD/BwEO/o//4gVDGX/KVDf5/+MYxAcOAq7cAYKIAIpQv+kkXjEukB/+kQ4EMBvCZE8XkUVhqQ7y4rooE19FSSVv///////////mA8t/9zH//////9TTTjlG/+MYxAoMwR4kAcd4AKD0SSgCgAoieUUNOnS8JUJssn8XJRXVqtigyCp2V6n//////8S4NFQWTEFNRTMuOTkuNVVVVVVVVVVV"
};
setInterval(function() {
    Update();
  }, 50);
