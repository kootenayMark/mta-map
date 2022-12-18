import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import {Icon, Circle, Style} from 'ol/style';
// import sync from 'ol-hashed'; // need to import if using sync
import Feature from 'ol/feature';
import { fromLonLat } from 'ol/proj';
import {Control, defaults as defaultControls} from 'ol/control';
import FullScreen from 'ol/control/FullScreen';
import {Vector as VectorSource} from 'ol/source';
import { clone, intersectsSegment } from 'ol/extent';
import XYZ from 'ol/source/XYZ';
//import LayerSwitcher from 'ol-layerswitcher';

const opensheet = "https://opensheet.elk.sh/19o_WmjjKn1ZE1940Brh9VrD9gaTyStMTF-kwbz2LJm4/elements"
const basemapUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
const dataURL = './data/mtaData.json'
const markerURL ='https://marktrueman.ca/wp-content/uploads/2022/12/mtaMarker_blk_xsm-1.png'

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
console.log(jsonObj) 

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
// console.log(pointArrFeatureCollection);
// console.log(geojsonString);

// map Variables
const vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: 'data:,' + encodeURIComponent(geojsonString)
});

const baseMap1 = new TileLayer({
  source: new XYZ({
    attributions:
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/Canvas/World_Dark_Gray_Base/MapServer">ArcGIS</a>',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  }),
})

const baseMap = new TileLayer({
  source: new OSM()
})

const vectorLayer = new VectorLayer({
  style: styleFunction,
  source: vectorSource
})

const view = new View({
  center: initialView,
  zoom: 8.5,
  minZoom: 2,
  maxZoom: 21
})

const map = new Map({
  //controls: defaultControls().extend([new NorthControl()]),
  target: 'map',
  layers: [baseMap, vectorLayer],
  view: view
});

var fullscreen = new FullScreen();
map.addControl(fullscreen);

// sync(map); need to import ol-hashed if using

function styleFunction (feature) {
  let styleZoom = view.getZoom();
  let resolution = view.getResolution();
  var markerSource = markerURL; 
  var iconSource = feature.get('image');
  var iconStyle = new Style({
    image: iconSource ? new Icon({
      src: iconSource,
      scale: 0.6
    }) : undefined
  });
  var iconStyle2 = new Style({
    image: iconSource ? new Icon({
      src: iconSource,
      scale: 1/Math.pow(resolution, 1/2)
    }) : undefined
  });
  var markerStyle = new Style({
    image: markerSource ? new Icon({
      src: markerSource,
      scale: 1
    }) : undefined
  });
  if (styleZoom < 11) {
    return [markerStyle];
  }
  else if (styleZoom < 16 ){
    return [iconStyle];
  }
  else {
    return [iconStyle2];
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
        
        var content = '<h3>' + feature.get('label') + '</h3>';
        content += '<h5 id=popup-category >' + "Category - " + feature.get('category') + '</h5>';
        content += '<h5 id=popup-website ><a href=' + feature.get('website') + '>' + feature.get('label') + '</a></h5>';
        content += '<h5 id=popup-email><a href=mailto:' + feature.get('email') + '>' + feature.get('email') + '</a></h5>';
        content += '<h5 id=popup-phone><a href=tel:' + feature.get('phone') + '>' + feature.get('phone') + '</a></h5>';
        content += '<h5 id=popup-address>' + feature.get('address') + '</h5>';
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

console.log(filtered_jsonObj); 

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
        companyIcon.src = jsonObj[eleId].image;
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

window.onresize = function()
{
  setTimeout( function() { map.updateSize();}, 200);
}