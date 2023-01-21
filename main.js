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
import * as olExtent from 'ol/extent';
import { defaults } from 'ol/interaction';
import {and} from 'ol/format/filter';
//import geojsonObjWFS from './LCICLandInv_select_clean_civAdrs.json';

const markerURL ='https://marktrueman.ca/wp-content/uploads/2022/12/mtaMarker_blk_xsm-1.png'
const businessLayerURL = "https://opensheet.elk.sh/19o_WmjjKn1ZE1940Brh9VrD9gaTyStMTF-kwbz2LJm4/elements"

const featureLayerWMS = 'http://51.79.71.43:8080/geoserver/LCICLandInventory/wms?service=WMS&version=1.1.0&request=GetMap&layers=LCICLandInventory%3ALCICLandInv_select_clean_civAdrs&bbox=428432.875%2C5427680.5%2C465716.65625%2C5453057.5&width=768&height=522&srs=EPSG%3A26911&styles=&format=application/openlayers#toggle'

const featureLayerWFS_1 = 'https://geoserver.marktrueman.ca/geoserver/LCICLandInventory/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=LCICLandInventory%3ALCICLandInv_Weighted&maxFeatures=1434&outputFormat=application%2Fjson'

/* ****geoserver layer parameters**** */
const geoServerDomain = 'https://geoserver.marktrueman.ca/geoserver/'
const nameSpace = 'LCICLandInventory'
const service = 'WFS'
const version = '2.0.0'
const request = 'GetFeature'
const typeName = 'LCICLandInventory%3ALCICLandInv_Weighted'
const count = '1434'

// Geoserver layer url
const featureLayerWFS = `${geoServerDomain}${nameSpace}/ows?service=${service}&version=${version}&request=${request}&typeName=${typeName}&count=${count}&outputFormat=application%2Fjson`
// console.log(featureLayerWFS);

/* ****Region center Coords **** */
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
  {region:'Trail and Area', id: 2, coords: trailandarea, zoom: 12.6},
  {region:'Castlegar and Area', id: 3, coords: castlegarandarea, zoom: 12},
  {region:'Nelson and Area', id: 4, coords: nelsonandarea, zoom: 13.5},
  {region:'Rossland and Area', id: 5, coords: rosslandandarea, zoom: 15}
]

/* **** data **** */
const jsonObj = await getData();

async function getData() {
  return fetch(businessLayerURL)
  .then(res => res.json())
}
//console.log(jsonObj) 
// fetch('//51.79.71.43:8080/geoserver/LCICLandInventory/wfs?service=WFS&' +
//         'version=1.1.0&request=GetFeature&typeName=LCICLandInventory:LCICLandInv_select_clean_civAdrs&' +
//         'outputFormat=application/json').then(function(response) {
//   return response.json();
// }).then(function(geojsonObjWFS) {

const geojsonObjWFS = await getData1();

async function getData1() {
  return fetch(featureLayerWFS)
  .then(res => res.json())
}

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

//const geojsonStringWFS = JSON.stringify(geojsonObjWFS)




/* ***map Variables*** */
const vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: 'data:,' + encodeURIComponent(geojsonString)
});
//console.log(vectorSource);
// const vectorSource1 = new TileWMS({
//   url: 'http://51.79.71.43:8080/geoserver/wms/LCICLandInventory',
//   params: {
//     LAYERS: 'LCICLandInv_select_clean_civAdrs',
//     TRANSPARENT: 'True'
//   }
// });
// const vectorSourceWFS = new VectorSource({
//   format: new GeoJSON(),
//   url: 'data:,' + encodeURIComponent(geojsonStringWFS)
// });
// console.log(vectorSourceWFS);
const vectorSourceWFS_1 = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonObjWFS)
});
// const vectorSourceWFS_filtered = new VectorSource({
//   features: new GeoJSON().readFeatures(filtered_geojsonObjWFS)
// });

// console.log(vectorSourceWFS_1);

// const styles = [
//   'RoadOnDemand',
//   'Aerial',
//   'AerialWithLabelsOnDemand',
//   'CanvasDark',
//   'OrdnanceSurvey',
// ];

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

// const DkGybaseMap = new TileLayer({
//   title: 'Dark Grey',
//   type: 'base',
//   visible: true,
//   source: tileSource,
//   renderer: 'canvas',
// });

const businessLayer = new VectorLayer({
  title: 'Businesses',
  style: styleFunction,
  visible: true,
  source: vectorSource,
  //declutterMode: 'obstacle',
  
});

// const landInvLayer = new TileLayer({
//   title: 'Land Inventory',
//   visible: false,
//   source: vectorSource1
// });
// const landInvLayer = new VectorLayer({
//   title: 'Land Inventory',
//   style: styleFunction2, 
//   visible: false,
//   source: vectorSourceWFS,
// });

const landInvLayer_1 = new VectorLayer({
  title: 'Land Inventory 1',
  style: styleFunction2, 
  visible: true,
  source: vectorSourceWFS_1,
});
// const landInvLayer_filtered = new VectorLayer({
//   title: 'Land Inventory Filtered',
//   style: styleFunction2, 
//   visible: false,
//   source: vectorSourceWFS_filtered,
// });

const view = new View({
  center: trailandarea, //initialView,
  zoom: 11, //8.5,
  minZoom: 2,
  maxZoom: 20,
  //constrainResolution: true,
  // updateWhileAnimating: false,
  // updateWhileInteracting: false,
  //resolutions: [0.07465, 0.944, 0.1196, 0.15, 0.19, 0.25, 0.31, 0.39, 0.49, 0.62, 0.79, 1.0, 1.26, 1.6, 2, 2.56, 3.25, 4, 5.2, 6.6, 8.4, 10.5, 13.3, 16.9, 21.4, 27, 35, 43, 55, 70, 90, 111, 140, 180, 225, 409.6, 5665, 9060, 14516]
});

const map = new Map({
  //controls: defaultControls().extend([new UtilizationScore()]),
  target: 'map',
  layers: [
    new LayerGroup({
      title: 'Base maps',
      layers: [BingArielBase, OSMbaseMap, BingBaseDark]
    }),
    new LayerGroup({
      title: 'Overlays',
      layers: [landInvLayer_1, /*landInvLayer_filtered,*/ businessLayer]
    })
  ],
  view: view,
  //interactions: defaults({ zoomDuration: 0 })
});

var layerSwitcher = new LayerSwitcher({
  tipLabel: 'Layer Switcher', // Optional label for button
  groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
});
map.addControl(layerSwitcher);
// sync(map); need to import ol-hashed if using

// var newRes =""
// var currRes = map.getView().getResolution();
// map.on('moveend', function() {
//   newRes = map.getView().getResolution();
//   if (currRes != newRes) {
//     console.log('zoom end, new Res: ' + newRes);
//     currRes = newRes;
//   }
// });

//var newRes = map.getView().getResolution();

//console.log('newRes1 ' + newRes)
function styleFunction (feature, resolution) {
  const resolutionThreshold_1 = 80;
  const resolutionThreshold_2 = 1.1;
  const resolutionThreshold_3 = 0.55;
  const markerSource = markerURL; 
  var iconSource1 = feature.get('image60x60');
  var iconSource2 = feature.get('image120x120');

  var markerStyle = new Style({
    image: markerSource ? new Icon({
      src: markerSource,
      scale: 1
    }) : undefined
  });
  var iconStyle1 = new Style({
    image: iconSource1 ? new Icon({
      src: iconSource1,
      scale: 0.6,
      maxCacheSize: 100
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
//   map.on('moveend', (function() {
//       if (newRes != map.getView().getResolution()) {
//           newRes = map.getView().getResolution();
//       }
// }));
  // console.log('newRes2 ' + newRes)
  switch (true) {
    case (resolution > resolutionThreshold_1):
      return [markerStyle];
      break;
    case (resolution <= resolutionThreshold_1 && resolution > resolutionThreshold_2):
      return [iconStyle1];
      break;
    case (resolution <= resolutionThreshold_2 && resolution > resolutionThreshold_3):
      return [iconStyle2];
      break;
    default:
      return [iconStyle3];
  }
};
   
function styleFunction2 (feature) {

let symbolValue = feature.get('utilization_score_weighted');
const transparency = 0.4;

const fillColors = ['215, 25, 28,', '229, 79, 53,', '243, 133, 78,', '254, 182, 106,', '254, 211, 140,', '255, 241, 175,', '239, 249, 177,', '207, 235, 145,', '174, 221, 114,', '128, 199, 95,', '77, 175, 80,']
const stroke_blk = new Stroke({
  color: 'black',
  width: 0.5,
})

let styles = [];
  for(let i = 0; i < fillColors.length; i++) {
    let style = new Style({
      stroke: stroke_blk,
      fill: new Fill({
        color: `rgb(${fillColors[i]} ${transparency})`,
      }),
    });
    styles.push(style);
  }
  if (symbolValue >= 5 && symbolValue <= 15) {
    return [styles[symbolValue-5]];
  }
};

/* ***popup*** */
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
        var geometryType = geometry.getType();
        var point_coord = geometry.getCoordinates();
        var extent = geometry.getExtent()
        var poly_coord = olExtent.getCenter(extent);
        
        console.log(geometryType);
        
      if (geometryType == 'Point'){
        var content = `<h2> ${feature.get('label')} </h2>`;
        content += `<h5 id=popup-category >CATEGORY - ${feature.get('category')}</h5>`;
        content += `<h5 id=popup-website ><a href= ${feature.get('website')}> ${feature.get('label')}</a></h5>`;
        content += `<h5 id=popup-email><a href=mailto: ${feature.get('email')}> ${feature.get('email')}</a></h5>`;
        content += `<h5 id=popup-phone><a href=tel: ${feature.get('phone')}>${feature.get('phone')}</a></h5>`;
        content += `<h5 id=popup-address>${feature.get('address')}</h5>`;
        content += `<hr class=rounded >`
        content += `<h5 id=popup-description>${feature.get('description')}</h5>`;

        content_element.innerHTML = content;
        overlay.setPosition(point_coord);
        
        console.info(feature.getProperties());
      } 
      else if (geometryType == 'MultiPolygon') {
        var content = `<h2 id= popup-pid class= landInv>PID - ${feature.get('pid')}</h2>`;
        content += `<h5 id=popup-legal class= landInv>Legal Description - ${feature.get('legal_description')}</h5>`;
        content += `<h5 id=popup-stated-area class= landInv>Stated Area - ${feature.get('stated_area')} Acres</h5>`;
        content += `<h5 id=popup-zone-name class= landInv>Zone - ${feature.get('zone_name')}</h5>`;
        content += `<h5 id=popup-zone-admin class= landInv>Zone Administration - ${feature.get('zone_admin')}</h5>`;
        content += `<h5 id=popup-water-service class= landInv>Water Service - ${feature.get('water_service')}</h5>`;
        content += `<h5 id=popup-sanitary-service class= landInv>Sanitary Service - ${feature.get('sanitary_service')}</h5>`;
        content += `<h5 id=popup-connectivity class= landInv>Connectivity - ${feature.get('connectivity')}</h5>`;
        content += `<h5 id=popup-flood-risk class= landInv>Flood Risk - ${feature.get('flood_risk')}</h5>`;
        content += `<h5 id=popup-environmental-remediation class= landInv>Environmental Remediation - ${feature.get('environmental_remediation')}</h5>`;
        content += `<h5 id=popup-electric-service class= landInv>Electrical Service - ${feature.get('electric_service')}</h5>`;
        content += `<h5 id=popup-natural-gas-service class= landInv>Natural Gas Service - ${feature.get('natural_gas_service')}</h5>`;
        content += `<h5 id=popup-ms-building class= landInv>Building Present - ${feature.get('ms_building')}</h5>`;
        content += `<h5 id=popup-size-threshold class= landInv>Greater than 0.3 Acres - ${feature.get('size_threshold(greaterthan0.3)')}</h5>`;
        content += `<h5 id=popup-zone-priority class= landInv>Zone Priority - ${feature.get('zone_priority')}</h5>`;
        content += `<h5 id=popup-current-use class= landInv>Current Usage - ${feature.get('current_use')}</h5>`;
        content += `<h5 id=popup-services class= landInv>Services - ${feature.get('services')}</h5>`;
        content += `<h5 id=popup-avg-slope class= landInv>Average Slope - ${feature.get('avg_slope')}</h5>`;
        content += `<h5 id=popup-civic-id class= landInv>Civic Id - ${feature.get('civic_id')}</h5>`;
        content += `<h5 id=popup-full-addr class= landInv>Address - ${feature.get('full_addr')}</h5>`;
        content += `<h5 id=popup-name-alias class= landInv>Name Alias - ${feature.get('name_alias')}</h5>`;
        content += `<h5 id=popup-notes class= landInv>Property Notes - ${feature.get('notes')}</h5>`;
        content += `<h5 id=popup-services-score-sum class= landInv>Services Sum - ${feature.get('services_score_sum')}</h5>`;
        content += `<h5 id=popup-utilization-score-basic class= landInv>Utilization Score Basic - ${feature.get('utilization_score_basic')}</h5>`;
        content += `<h5 id=popup-utilization-score-services class= landInv>Utilization Score Services - ${feature.get('utilization_score_services')}</h5>`;
        content += `<h5 id=popup-utilization-score-weighted class= landInv>Utilization Score Weighted - ${feature.get('utilization_score_weighted')}</h5>`;

        content_element.innerHTML = content;
        overlay.setPosition(poly_coord);
        
        console.info(feature.getProperties());
      }
    }
});
// map.on('pointermove', function(e) {
//     if (e.dragging) return;
       
//     var pixel = map.getEventPixel(e.originalEvent);
//     var hit = map.hasFeatureAtPixel(pixel);
    
//     map.getTarget().style.cursor = hit ? 'pointer' : '';
// });

/* ****DOM element variables**** */
let groups = document.getElementById("groups");
let List = document.getElementById('list');
let FeatureList = document.getElementById("feature-list");
let listToggle = document.getElementById('list-toggle');
let featureCloser = document.getElementById('feature-closer');
let wrapper = document.getElementById('wrapper');
let current_view_values = []; // holding variable for current mapview
let tableid = ""; //holding variable for clicked business

/* ****event listeners**** */
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

// filter business attributes for feature panel
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

//console.log(filtered_jsonObj); 

/* ****function to create and populate business feature**** */
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

/* dynamically created DOM element selections */
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

const utilization = document.getElementById("utilization");
const uti_button = document.getElementById("uti-button");

utilization.innerHTML = `
<h4>Utilization Score</h4>
  <p>The utilization score is generated by weighting and summing up factors such as zoning, connectivity, flood risk, utility service, minimum size, average slope of parcel,and current use/ownership. Current use was established using Microsoft Canadian building footprints, Satelite Imagery, and local knowledge and given a score from 1 to 4.</p>
    <ul>
      <li>1 - In use long term by known entity</li> 
      <li>2 - In use, term unknown</li>
      <li>3 - In use, term unknown, potential for redevelopment</li>
      <li>4 - Vacant lot, appears not to be in use</li>
    <ul/>
<p>Data accurate as of April 2022.</p>`

uti_button.addEventListener("click", function() {  
  if (utilization.style.display === "block") {
    utilization.style.display = "none";
  } else {
    utilization.style.display = "block";
  }
});
// window.onresize = function()
// {
//   setTimeout( function() { map.updateSize();}, 300);
// }
// });