layer = new ol.layer.Tile({
    source: new ol.source.OSM()
    })

var cl =false;
var addbtn = document.getElementById('addbtn');
var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var popupCloser = document.getElementById("popup-closer");
var btnsave = document.getElementById('save')
var btncancle = document.getElementById('cancel')

var wuhan = ol.proj.fromLonLat([114.402226,30.519573 ]);
var map = new ol.Map({
    target: 'map',
    layers: [
        layer
    ],
    view: new ol.View({
    center: wuhan,
    zoom: 14,
    minZoom:8,
    maxZoom:18
    })
    });
var btn = document.getElementById('btn')
btn.addEventListener('click', search)
//实例化矢量点要素，通过矢量图层添加到地图容器中
//这样就实现了预先加载图文标注
var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(wuhan),
    name: '中国地质大学',                         //名称属性
    label:'school',
});
//设置点要素样式
var overlay = new ol.Overlay({
    //设置弹出框的容器
   element: container,
   //是否自动平移，即假如标记在屏幕边缘，弹出时自动平移地图使弹出框完全可见
   autoPan: true
});
map.on('click',function(e){
    //在点击时获取像素区域
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    var features = map.getFeaturesAtPixel(pixel);
    if(hit){
    map.forEachFeatureAtPixel(pixel,function(feature){
        //coodinate存放了点击时的坐标信息
        var coodinate = e.coordinate;
        //设置弹出框内容，可以HTML自定义
        content.innerHTML = 
        "<p>name: " +features[0].values_.name+"</p>"+"<br/>"+
        "<p>position:" + coodinate + "</p>"+"<br/>"+
        "<p>lable:"+features[0].values_.label+"</p>"+"<br/>"
        // "<img src = 'pic\\126438.png' style='length:50px,height:50px'></img>"
        ;
        //设置overlay的显示位置getEventPixel
        overlay.setPosition(coodinate);
        //显示overlay
        map.addOverlay(overlay);
    }

    );
}
else {
    map.getOverlays().clear();
    }
});
iconFeature.setStyle(createLabelStyle(iconFeature));
//矢量标注的数据源
var vectorSource = new ol.source.Vector({
    features: [iconFeature]
});
//矢量标注图层
var vectorLayer = new ol.layer.Vector({
    source: vectorSource
});
map.addLayer(vectorLayer);

//矢量标注样式设置函数，设置image为图标ol.style.Icon
function createLabelStyle(feature){
    console.log(feature);
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 60],              //锚点
            anchorOrigin:'top-right',       //锚点源
            anchorXUnits: 'fraction',       //锚点X值单位
            anchorYUnits: 'pixels',         //锚点Y值单位
            offsetOrigin: 'top-right',      //偏移原点
            opacity: 0.75,
            src: '/static/pic/11.png'  //图标的URL
        }),
        text: new ol.style.Text({
            textAlign: 'center',            //位置
            textBaseline: 'middle',         //基准线
            font: 'normal 14px 微软雅黑',    //文字样式
            text: feature.get('name'),      //文本内容
            fill: new ol.style.Fill({       //文本填充样式（即文字颜色)
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: '#F00', 
                width: 2
            })
        })
    });
}

function show(){

    $("#my_dialog").show();
}
function create_paper_save(){
    cl = false;
    map.on('click', function(evt){
        if(!cl){
        var gname = [$("#name").val(),$("#kind").val()]
        var coordinate = evt.coordinate;        //鼠标单击点的坐标
        //新建一个要素ol.Feature
    
        var newFeature = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),  //几何信息
            name: gname[0],
            label: gname[1]
        });
        newFeature.setStyle(createLabelStyle(newFeature));      //设置要素样式
        vectorSource.addFeature(newFeature);
        $("#my_dialog").hide();
        cl = true;
        SendPOST("/add","position="+coordinate.toString()+"&name="+gname[0]+"&label="+gname[1])
    }
    }
    );
}

function SendPOST(url,argc){
    var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
    httpRequest.open('POST', url, true); //第二步：打开连接/***发送json格式文件必须设置请求头 ；如下 - */
    httpRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）var obj = { name: 'zhansgan', age: 18 };
    httpRequest.send(argc);//发送请求
    /**
     * 获取数据后的处理程序
     */
    httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
            var json = httpRequest.responseText;//获取到服务端返回的数据
            console.log(json);
        }
        else{
            console.log("err  "+httpRequest.status)
        }
    };
}

btncancle.addEventListener("click", ()=>{$("#my_dialog").hide();})
btnsave.addEventListener('click',create_paper_save)
addbtn.addEventListener('click', ()=>{
    show();

    }
)

function search(){
    var POI = document.getElementById("POI").value;
    var markerList = vectorSource.getFeatures();
    var resultList = [];
    markerList.forEach(v=>{
        if(v.values_.label==POI){
            resultList.push(v)
        }
    })
    var resTable = document.getElementById('result');
    var rowNum=resTable.rows.length;
    for (i=1;i<rowNum;i++)
    {
        resTable.deleteRow(i);
        rowNum=rowNum-1;
        i=i-1;
    }
    resultList.forEach(v=>{
        var trobj =document.createElement("tr");
        var tdobj_name = document.createElement("td");
        var tdobj_click = document.createElement("td");
        var click = document.createElement("button")
        var tdobj_position = document.createElement("td");
        var tdobj_label = document.createElement("td");
        tdobj_name.innerHTML=v.values_.name;
        tdobj_label.innerHTML = v.values_.label;
        tdobj_position.innerHTML=ol.proj.transform(v.values_.geometry.flatCoordinates, 'EPSG:3857', 'EPSG:4326')
        .join(",");
        click.innerHTML = "定位";
        tdobj_click.appendChild(click);
        trobj.appendChild(tdobj_name);
        trobj.appendChild(tdobj_label);
        trobj.appendChild(tdobj_position);
        trobj.appendChild(tdobj_click);
        resTable.appendChild(trobj);
        click.addEventListener("click",function(){
            map.getView().setCenter(v.values_.geometry.flatCoordinates);
            var overlay = new ol.Overlay({
                //设置弹出框的容器
               element: container,
               //是否自动平移，即假如标记在屏幕边缘，弹出时自动平移地图使弹出框完全可见
               autoPan: true
            });
            content.innerHTML = 
        "<p>name: " +v.values_.name+"</p>"+"<br/>"+
        "<p>position:" +
         ol.proj.transform(v.values_.geometry.flatCoordinates, 'EPSG:3857', 'EPSG:4326')
        .join(",") + 
        "</p>"+"<br/>"
        +
        "<p>lable:"+v.values_.label+"</p>"+"<br/>"
        // "<img src = 'pic\\126438.png' style='length:50px,height:50px'></img>"
        ;
        //设置overlay的显示位置getEventPixel
        overlay.setPosition(v.values_.geometry.flatCoordinates);
        //显示overlay
        map.addOverlay(  overlay);
        })

    })
    
}
