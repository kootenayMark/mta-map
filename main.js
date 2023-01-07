import './style.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import Stroke from 'ol/style/Stroke.js';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import {Icon, Circle, Style, Fill} from 'ol/style';
// import sync from 'ol-hashed'; // need to import if using sync
import Feature from 'ol/feature';
import { fromLonLat } from 'ol/proj';
import {Control, defaults as defaultControls} from 'ol/control';
import FullScreen from 'ol/control/FullScreen';
import {Vector as VectorSource, WMTS} from 'ol/source';
import { clone, intersectsSegment } from 'ol/extent';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import TileWMS from 'ol/source/TileWMS';
import BingMaps from 'ol/source/BingMaps.js';


const opensheet = "https://opensheet.elk.sh/19o_WmjjKn1ZE1940Brh9VrD9gaTyStMTF-kwbz2LJm4/elements"

// const featureLayer1WMS = 'http://51.79.71.43:8080/geoserver/LCICLandInventory/wms?service=WMS&version=1.1.0&request=GetMap&layers=LCICLandInventory%3ALCICLandInv_select_clean_civAdrs&bbox=428432.875%2C5427680.5%2C465716.65625%2C5453057.5&width=768&height=522&srs=EPSG%3A26911&styles=&format=application/openlayers#toggle'
const featureLayer1 = 'http://51.79.71.43:8080/geoserver/LCICLandInventory/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=LCICLandInventory%3ALCICLandInv_select_clean_civAdrs&maxFeatures=1434&outputFormat=application%2Fjson'
const dataURL = './data/mtaData.json'
const markerURL ='https://marktrueman.ca/wp-content/uploads/2022/12/mtaMarker_blk_xsm-1.png'

// http://localhost:8080/geoserver/myworkspace/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=myfeature&outputFormat=application/json


// Region center Coords
const initialView = fromLonLat([-117.97998, 49.55215])
const britishcolumbia = fromLonLat([-119.57998, 49.75215])
const westkootenay = fromLonLat([-117.38374303482402, 49.34945272204586])
const trailandarea = fromLonLat([-117.66993534984215, 49.100971359691975])
const castlegarandarea = fromLonLat([-117.69479454290793, 49.295732630900695])
const nelsonandarea = fromLonLat([-117.2900500026088, 49.477387788103334])
const rosslandandarea = fromLonLat([-117.80493087932007, 49.078833201701485])

const regions = [
  {region:'British Columbia', id: 0, coords: britishcolumbia, zoom: 7.5},
  {region:'West Kootenay', id: 1, coords: westkootenay, zoom: 9},
  {region:'Trail and Area', id: 2, coords: trailandarea, zoom: 12},
  {region:'Castlegar and Area', id: 3, coords: castlegarandarea, zoom: 12},
  {region:'Nelson and Area', id: 4, coords: nelsonandarea, zoom: 13.5},
  {region:'Rossland and Area', id: 5, coords: rosslandandarea, zoom: 15}
]

// data    
const jsonObj = await getData();

async function getData() {
  return fetch(opensheet)
  .then(res => res.json())
}
//console.log('jsonObj' + jsonObj) 

const geojsonObj1 = await getData1();

async function getData1() {
  return fetch(featureLayer1)
  .then(res => res.json())
}
//console.log('geojsonObj1' + geojsonObj1) 

//let jsonString = JSON.stringify(jsonObj);
//console.log(jsonString);

// to GeoJSON.Point array
const geoJSONPointArr = jsonObj.map(row => {
  return {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [row.longitude, row.latitude]
    },
    "properties": row
  }
});

// to GeoJSON.FeatureCollection
const pointArrFeatureCollection = {
  "type": "FeatureCollection",
  "features": geoJSONPointArr
}

const geojsonString = JSON.stringify(pointArrFeatureCollection)

const geojsonString1 = JSON.stringify(geojsonObj1)


// map Variables
const vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: 'data:,' + encodeURIComponent(geojsonString)
});
console.log(vectorSource);

const vectorSource1 = new VectorSource({
  format: new GeoJSON(),
  url: 'data:,' + encodeURIComponent(geojsonString1)
});

// const vectorSource1 = new VectorSource({
//   features: new GeoJSON().readFeatures(geojsonObj1)
// });
console.log(vectorSource1);

// const styles = [
//   'RoadOnDemand',
//   'Aerial',
//   'AerialWithLabelsOnDemand',
//   'CanvasDark',
//   'OrdnanceSurvey',
// ];


const tileSource = new XYZ({
  attributions:
    'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
    'rest/services/Canvas/World_Dark_Gray_Base/MapServer">ArcGIS</a>',
  url:
    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
});

const OSMbaseMap = new TileLayer({
  title: 'Open Street Maps',
  type: 'base',
  visible: false,
  source: new OSM()
});

const BingBaseDark = new TileLayer({
  title: 'Bing Canvas Dark',
  type: 'base',
  visible: true,
  source: new BingMaps({
    key: 'Aq3zTnJcwqxgsr49ctWDJQbSaZsmhkdIrDuFMBdoCXZTBE31Gl-nam7XhVkbHHy9',
    imagerySet: 'CanvasDark'
  })
});

const BingArielBase = new TileLayer({
  title: 'Bing Ariel Image',
  type: 'base',
  visible: false,
  source: new BingMaps({
    key: 'Aq3zTnJcwqxgsr49ctWDJQbSaZsmhkdIrDuFMBdoCXZTBE31Gl-nam7XhVkbHHy9',
    imagerySet: 'Aerial'
  })
});

const DkGybaseMap = new TileLayer({
  title: 'Dark Grey',
  type: 'base',
  visible: true,
  source: tileSource,
});

const businessLayer = new VectorLayer({
  title: 'Businesses',
  style: styleFunction,
  visible: true,
  source: vectorSource
});

const landInvLayer = new VectorLayer({
  title: 'Land Inventory',
  style: styleFunction2, 
  visible: false,
  source: vectorSource1
});
// const landInvLayer = new TileLayer({
//   title: 'Land Inventory',
//   visible: false,
//   source: vectorSource1
// });

const view = new View({
  center: initialView,
  zoom: 8.5,
  minZoom: 2,
  maxZoom: 21
});

const map = new Map({
  //controls: defaultControls().extend([new NorthControl()]),
  target: 'map',
  layers: [
    new LayerGroup({
      title: 'Base maps',
      layers: [BingArielBase, OSMbaseMap, BingBaseDark]
    }),
    new LayerGroup({
      title: 'Overlays',
      layers: [landInvLayer, businessLayer]
    })
  ],
  view: view
});

// var fullscreen = new FullScreen();
// map.addControl(fullscreen);

var layerSwitcher = new LayerSwitcher({
  tipLabel: 'Légende', // Optional label for button
  groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
});
map.addControl(layerSwitcher);

// sync(map); need to import ol-hashed if using

function styleFunction (feature) {
  let styleZoom = view.getZoom();
  let resolution = view.getResolution();
  var markerSource = markerURL; 
  var iconSource1 = feature.get('image60x60');
  var iconSource2 = feature.get('image120x120');
  var iconStyle1 = new Style({
    image: iconSource1 ? new Icon({
      src: iconSource1,
      scale: 0.6
    }) : undefined
  });
  var iconStyle2 = new Style({
    image: iconSource1 ? new Icon({
      src: iconSource1,
      scale: 0.8/Math.pow(resolution, 1/2)
    }) : undefined
  });
  var iconStyle3 = new Style({
    image: iconSource2 ? new Icon({
      src: iconSource2,
      scale: 0.4/Math.pow(resolution, 1/2)
    }) : undefined
  });
  var markerStyle = new Style({
    image: markerSource ? new Icon({
      src: markerSource,
      scale: 1
    }) : undefined
  });
  //console.log(styleZoom);
  if (styleZoom < 11) {
    return [markerStyle];
  }
  else if (styleZoom <= 17 ){
    return [iconStyle1];
  }
  else if (styleZoom > 17 && styleZoom < 18 ){
    return [iconStyle2];
  }
  else {
    return [iconStyle3];
  }
}

function styleFunction2 (feature) {

  let fillColour = feature.get('utilization_score_weighted'); 
  const transparency = 0.4;
  
  let style5 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(215, 25, 28, ${transparency})`,
      }),
    });
  let style6 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(229, 79, 53, ${transparency})`,
      }),
    });
  let style7 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(243, 133, 78, ${transparency})`,
      }),
    });
  let style8 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(254, 182, 106, ${transparency})`,
      }),
    });
  let style9 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(254, 211, 140, ${transparency})`,
      }),
    });
  let style10 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(255, 241, 175, ${transparency})`,
      }),
    });
  let style11 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(239, 249, 177, ${transparency})`,
      }),
    });
  let style12 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(207, 235, 145,${transparency})`,
      }),
    });
  let style13 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: `rgb(174, 221, 114, ${transparency})`,
      }),
    });
  let style14 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: 'rgb(128, 199, 95, 0.4)',
      }),
    });
  let style15 = new Style({
      stroke: new Stroke({
        color: 'black',
        width: 0.5,
      }),
      fill: new Fill({
        color: 'rgb(77, 175, 80, 0.4)',
      }),
    });
    if (fillColour === 5) {
      return [style5];
    }
    else if (fillColour === 6 ){
      return [style6];
    }
    else if (fillColour === 7 ){
      return [style7];
    }
    else if (fillColour === 8 ){
      return [style8];
    }
    else if (fillColour === 9 ){
      return [style9];
    }
    else if (fillColour === 10 ){
      return [style10];
    }
    else if (fillColour === 11 ){
      return [style11];
    }
    else if (fillColour === 12 ){
      return [style12];
    }
    else if (fillColour === 13 ){
      return [style13];
    }
    else if (fillColour === 14 ){
      return [style14];
    }
    else {
      return [style15];
    }
  }

// popup
var container = document.getElementById('popup'),
    content_element = document.getElementById('popup-content'),
    closer = document.getElementById('popup-closer');

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
var overlay = new Overlay({
    element: container,
    autoPan: true,
    offset: [0, -10]
});
map.addOverlay(overlay);

map.on('click', function(evt){
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        return feature;
      });
    if (feature) {
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h2>' + feature.get('label') + '</h2>';
        content += '<h5 id=popup-category >' + "CATEGORY - " + feature.get('category') + '</h5>';
        content += '<h5 id=popup-website ><a href=' + feature.get('website') + '>' + feature.get('label') + '</a></h5>';
        content += '<h5 id=popup-email><a href=mailto:' + feature.get('email') + '>' + feature.get('email') + '</a></h5>';
        content += '<h5 id=popup-phone><a href=tel:' + feature.get('phone') + '>' + feature.get('phone') + '</a></h5>';
        content += '<h5 id=popup-address>' + feature.get('address') + '</h5>';
        content += '<hr class=rounded >'
        content += '<h5 id=popup-description>' + feature.get('description') + '</h5>';

        content_element.innerHTML = content;
        overlay.setPosition(coord);
        
        console.info(feature.getProperties());
    }
});
// map.on('pointermove', function(e) {
//     if (e.dragging) return;
       
//     var pixel = map.getEventPixel(e.originalEvent);
//     var hit = map.hasFeatureAtPixel(pixel);
    
//     map.getTarget().style.cursor = hit ? 'pointer' : '';
// });

// DOM element variables
let groups = document.getElementById("groups");
let List = document.getElementById('list');
let FeatureList = document.getElementById("feature-list");
let listToggle = document.getElementById('list-toggle');
let featureCloser = document.getElementById('feature-closer');
let wrapper = document.getElementById('wrapper');
let current_view_values = []; // holding variable for current mapview
let tableid = ""; //holding variable for clicked business

// event listeners
featureCloser.addEventListener('click', showList);
listToggle.addEventListener('click', hideList);

// create elements for business list and set attributes
regions.forEach((group)=>{
  let li = document.createElement("li");
  let ul = document.createElement("ul");
  let a = document.createElement("a");
  let img = document.createElement("img");
  let span = document.createElement("span");
  let node = document.createTextNode(group.region);
  li.classList.add("regions");
  li.setAttribute("id", "li_" + group.region);
  a.setAttribute("id", "a_" + group.region);
  a.setAttribute("href", "#");
  img.setAttribute("src", "https://marktrueman.ca/wp-content/uploads/2022/12/opened_org.png");
  img.setAttribute("alt", "");
  img.setAttribute("id", group.region);
  img.setAttribute("border", "0");
  ul.setAttribute("id", "ul_" + group.region);
  span.setAttribute("id", group.id);
  a.appendChild(img);
  a.appendChild(span);
  span.appendChild(node);
  li.appendChild(a);
  groups.appendChild(li);
  li.appendChild(ul);
  //sub-lists
  jsonObj.forEach((item)=>{
    if (group.region === item.region){
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.setAttribute('id', item.id);
    a.setAttribute('href', '#');
    a.classList.add('business');
    a.classList.add('nofocus');
    a.innerText = item.label;
    ul.appendChild(li);
    li.appendChild(a);
    }
  });
});

const filtered_jsonObj = [];
jsonObj.forEach((item)=>{
  const selectedFields = ['label', 'category', 'website', 'email', 'phone', 'address', 'region', 'description', 'tags']
  const arr = Object.keys(item)
  .filter((key) => selectedFields.includes(key))
  .reduce((obj, key) => {
    obj[key] = item[key];
    return obj;
  }, {});
filtered_jsonObj.push(arr);
});

//console.log('filtered_jsonObj ' + filtered_jsonObj); 

for (let i =0; i < filtered_jsonObj.length; i++) {  
  // replace character delimiters
  let tags = filtered_jsonObj[i].tags; tags = tags.split("|");
  let attributes = document.getElementById('attributes');
  let table = document.createElement("table");
  table.id = 'table-' + [i]; 
  table.classList.add('hidden');
  attributes.appendChild(table);
  
  for(let h in filtered_jsonObj[i]) {  
    let tr = document.createElement("tr"); 
    let th = document.createElement("th");
    let td = document.createElement("td");
    let a = document.createElement("a");
   
    if (h != 'label') {
      th.id = h; th.innerText = h;
      td.id = h + '-value';
      
      if (th.id === 'category') {
        td.innerText = filtered_jsonObj[i].category;
      } 
      else if (th.id === 'website') {
        a.id = h + '-innerValue';
        a.setAttribute("href", filtered_jsonObj[i].website);
        a.innerText = filtered_jsonObj[i].label;
        td.appendChild(a);
      }
      else if (th.id === 'email') {
        a.id = h + '-innerValue';
        a.setAttribute("href", "mailto:"+filtered_jsonObj[i].email);
        a.innerText = filtered_jsonObj[i].email;
        td.appendChild(a);
      }
      else if (th.id === 'phone') {
        a.id = h + '-innerValue';
        a.setAttribute("href", "tel:"+filtered_jsonObj[i].phone);
        a.innerText = filtered_jsonObj[i].phone;
        td.appendChild(a);
      }
      else if (th.id === 'address') {
        td.innerText = filtered_jsonObj[i].address;
      }
      else if (th.id === 'region') {
        td.innerText = filtered_jsonObj[i].region;
      }
      else if (th.id === 'description') {
        td.innerText = filtered_jsonObj[i].description;
      };
      // create buttons from tags (add filter function later)
      if (th.id == 'tags') {
        tags.forEach(function (t, index) {
          let tagButton = document.createElement('button');
          tagButton.id = 'tag_' + index; tagButton.className = "tags";
          tagButton.innerHTML = t;
          td.appendChild(tagButton);
        });
      };
      tr.appendChild(th);
      tr.appendChild(td);
      table.appendChild(tr); 
    };
  };
};

// dynamically created DOM element selections
const groupItems = document.querySelector('#groups');
const regionItems = document.querySelectorAll('.regions > a > span');
const listItems = document.querySelectorAll('.business');

toggle_businessList();
function toggle_businessList() {
  groupItems.addEventListener('click', (e) => 
  {
    // console.log(e.target.id);
    let ul = "ul_" + e.target.id;
    let img = e.target.id;
    // console.log(ul);
    // console.log(img);
    let ulElement = document.getElementById(ul);
    // console.log(ulElement);
    let imgElement = document.getElementById(img);
    // console.log(imgElement)
    if (ulElement){
      if (ulElement.className == 'closed'){
        ulElement.className = "open";
        imgElement.src = 'https://marktrueman.ca/wp-content/uploads/2022/12/opened_org.png'; //"images/opened_org.png";
        }else{
        ulElement.className = "closed";
        imgElement.src = 'https://marktrueman.ca/wp-content/uploads/2022/12/closed_org.png'; //"images/closed_org.png";
      }
    }
  });
};

listClick();
function listClick() {
  // click event listener for groups headings/regions
  regionItems.forEach(item => {
    item.addEventListener('click', regionCLick); 
  });

  // click event listener for businesses
  listItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Retrieve id from clicked element
      let eleId = e.target.id;
      // retrieve longitude from json using ID
      let coordX = jsonObj[eleId].longitude;
      // retrieve latitude from json using ID
      let coordY = jsonObj[eleId].latitude;
      // convert coords from lat-long to UTM
      let coords = fromLonLat([coordX, coordY]);
      let tableID = 'table-' + eleId;
      let table = document.getElementById(tableID);
      tableid = tableID;
      // If element has id, build company info pane based on id 
      if (eleId !== '') {
        // get current view value 
        current_view_values = getValues();
        // hide list, show business info pane
        List.style.display = "none";
        FeatureList.style.display = "block";
        table.classList.remove('hidden');
        // populate business info fields
        business.innerText = jsonObj[eleId].label;
        companyIcon.src = jsonObj[eleId].image60x60;
        view.animate({
          center: coords,
          zoom: 17,
          duration:2000,
        });
      }
      // If element has no id
      else { 
          console.log("An element without an id was clicked.");
      }
    });  
  });
};

function hideList() {
    // Update container size, timeout must match or exceed css transition for list pane closing
    setTimeout(function () {
      map.updateSize();
    }, 500)
    wrapper.classList.toggle('no-list');
};

function showList() {
  FeatureList.style.display = "none";
  List.style.display = "flex"; 
  let table = document.getElementById(tableid);
  //console.log(table);
  table.classList.add('hidden');
  view.animate({
    center: current_view_values.currentCenter, 
    zoom: current_view_values.currentZoom,
    duration: 1000,
  });
};

// function to zoom in to region from clicking regional heading
function regionCLick() {
  // Retrieve id from clicked element
  let eleId = this.id;
  // console.log(eleId);
  
  // If element has id
  if (eleId !== '') {
    view.animate({
      center: regions[eleId].coords,
      zoom: regions[eleId].zoom,
      duration: 3000,
    });
  }
  // If element has no id
  else { 
      console.log("An element without an id was hovered.");
  }
};

// function to get current mapview values
function getValues() {
  let currentCenter = view.getCenter();
  //console.log(currentCenter);
  let currentZoom = view.getZoom();
  //console.log(currentZoom);
  let viewValues = {
    currentCenter: currentCenter,
    currentZoom: currentZoom
  }
  console.log(viewValues);
  return viewValues;
};

// window.onresize = function()
// {
//   setTimeout( function() { map.updateSize();}, 300);
// }
