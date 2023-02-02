import './style.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import {Icon, Circle, Style, Fill, Stroke} from 'ol/style';
// import sync from 'ol-hashed'; // need to import if using sync
import Feature from 'ol/feature';
import { fromLonLat } from 'ol/proj';
import {toLonLat} from 'ol/proj';
import {Control, defaults as defaultControls} from 'ol/control';
import {Vector as VectorSource, WMTS} from 'ol/source';
import { clone, intersectsSegment } from 'ol/extent';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import TileWMS from 'ol/source/TileWMS';
import BingMaps from 'ol/source/BingMaps.js';
import * as olExtent from 'ol/extent';
import ImageWMS from 'ol/source/ImageWMS.js';
import ImageLayer from 'ol/layer/Image';
import LineString from 'ol/geom/LineString.js';
import {getCenter} from 'ol/extent';


const markerURL ='https://marktrueman.ca/wp-content/uploads/2022/12/mtaMarker_blk_xsm-1.png'
const infoIcon = 'https://marktrueman.ca/wp-content/uploads/2023/01/icons8-info-67.png'
const businessLayerURL = "https://opensheet.elk.sh/19o_WmjjKn1ZE1940Brh9VrD9gaTyStMTF-kwbz2LJm4/elements"

/* ****geoserver layer parameters**** */
const geoServerDomain = 'https://geoserver.marktrueman.ca/geoserver/'
const geoServerDomain1 = 'http://51.79.71.43:8080/geoserver/'
const nameSpace = 'LCICLandInventory'
const service = 'WFS'
const version = '2.0.0'
const request = 'GetFeature'
const layerName = 'Development Potential'
const layerName2 = 'MTA_Companies'
//const layerName = 'LCICLandInv_Weighted'
const typeName = `${nameSpace}%3A${layerName}`
const typeName2 = `${nameSpace}%3A${layerName2}`
const count = '1434'
const count2 = '85'

// Geoserver geojson (WFS) layer url
const featureLayerWFS = `${geoServerDomain}${nameSpace}/ows?service=${service}&version=${version}&request=${request}&typeName=${typeName}&count=${count}&outputFormat=application%2Fjson`

const featureLayerWFS_points = `${geoServerDomain}${nameSpace}/ows?service=${service}&version=${version}&request=${request}&typeName=${typeName2}&count=${count2}&outputFormat=application%2Fjson`

// Geoserver WMS layer url
const featureLayerWMS = `${geoServerDomain1}${nameSpace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${typeName}&bbox=428432.875%2C5427680.5%2C465716.65625%2C5453057.5&width=768&height=522&srs=EPSG%3A26911&styles=&format=application/openlayers#toggle`

const featureLayerWFS_1 = 'https://geoserver.marktrueman.ca/geoserver/LCICLandInventory/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=LCICLandInventory%3ALCICLandInv_Weighted&maxFeatures=1434&outputFormat=application%2Fjson'

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
  {region:'Trail and Area', id: 2, coords: trailandarea, zoom: 12.4},
  {region:'Castlegar and Area', id: 3, coords: castlegarandarea, zoom: 12},
  {region:'Nelson and Area', id: 4, coords: nelsonandarea, zoom: 13.5},
  {region:'Rossland and Area', id: 5, coords: rosslandandarea, zoom: 15}
]

/* **** data **** */

/** Business data */
const jsonObj = await getData();
async function getData() {
  return fetch(businessLayerURL)
  .then(res => res.json())
} 
const geojsonObj_geoserver = await getData2();
async function getData2() {
  return fetch(featureLayerWFS_points)
  .then(res => res.json())
} 

// to GeoJSON Point array
const geoJSONPointArr = jsonObj.map((row, index) => {
  return {
    "geometry_name": "geom",
    "id": "MTA_Companies." + index,
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": fromLonLat([row.longitude, row.latitude])
    },
    "properties": row
  }
});
// to GeoJSON.FeatureCollection
const geojsonObj = {
 "type": "FeatureCollection",
 
 "features": geoJSONPointArr,
 "totalFeatures": 85,
  "numberMatched": 85,
  "numberReturned": 85,
  "timeStamp": "2023-01-08T18:56:56.904Z",
 "crs": {
  "type": "name",
  "properties": { "name": "urn:ogc:def:crs:EPSG::3857" }
}
}

// const geojsonString = JSON.stringify(pointArrFeatureCollection)
// console.log(geojsonString)

// fetch(featureLayerWFS).then(function(response) {
//   return response.json();
// }).then(function(geojsonObjWFS) {

/** Land Inventory Data */
const geojsonObjWFS = await getData1();

async function getData1() {
  return fetch(featureLayerWFS)
  .then(res => res.json())
}
// cast property "pid" to number
geojsonObjWFS.features.forEach((feature) => {
  feature.properties.pid = Number(feature.properties.pid)
})

// instantiate variables to hold filtered layers
var geojsonObjWFS_filtered = geojsonObjWFS;
var geojsonObj_filtered;
let businessLayer_filtered;
let vectorSource_filtered;

/* ***map Variables*** */
const vectorSource = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonObj)
  // format: new GeoJSON(),
  // url: 'data:,' + encodeURIComponent(geojsonString)
});
// console.log(vectorSource);

const vectorSourceWFS = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonObjWFS)
});
// console.log(vectorSourceWFS);

const vectorSourceWMS_1 = new ImageWMS({
  //url: `${geoServerDomain1}${nameSpace}/wms?`,
  url: 'http://51.79.71.43:8080/geoserver/wms',
  // params: {
  //   LAYERS: 'LCICLandInv_select_clean_civAdrs', 'TILED': true,
  //   TRANSPARENT: 'True'
  // },
  params: {'LAYERS': 'LCICLandInventory:Land Inventory WMS'},
  ratio: 1,
  serverType: 'geoserver'
});
// const vectorSourceWFS_1 = new VectorSource({
//   format: new GeoJSON(),
//   url: 'data:,' + encodeURIComponent(geojsonStringWFS)
// });
// console.log(vectorSourceWFS_1);


//console.log(vectorSourceWFS_filtered);

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

const businessLayer = new VectorLayer({
  title: 'Businesses',
  style: styleFunction,
  visible: true,
  source: vectorSource,
});
// console.log(businessLayer)

// const landInvLayerWMS = new ImageLayer({
//   title: 'Land Inventory WMS',
//   visible: true,
//   source: vectorSourceWMS_1,
//   // style: styleFunction2
// });

const landInvLayerWFS = new VectorLayer({
  title: 'Land Inventory',
  style: styleFunction2, 
  visible: true,
  source: vectorSourceWFS,
});
// console.log(landInvLayerWFS)

const view = new View({
  center: initialView, //trailandarea, 
  zoom: 8.5,
  minZoom: 2,
  maxZoom: 19,
  constrainResolution: false,
});

const baseMaps = new LayerGroup({
  title: 'Base maps',
  layers: [BingArielBase, OSMbaseMap, BingBaseDark]
})
var overlays = new LayerGroup({
  title: 'Overlays',
  layers: [landInvLayerWFS]
})
// var points = new LayerGroup({
//   title: 'Businesses',
//   layers: [businessLayer]
// })

// class Search extends Control {
//   /**
//    * @param {Object} [opt_options] Control options.
//    */
//   constructor(opt_options) {
//     const options = opt_options || {};
    
//     const element = document.createElement('div');
//     const searchInput = document.createElement('input');
//     searchInput.setAttribute("type", "text");
//     searchInput.setAttribute("id", "search-input");
//     searchInput.setAttribute("placeholder", "Search...name, tag, keyword");
//     searchInput.classList.add("search-bar");
    
//     element.className = 'search-bar ol-unselectable ol-control';
//     element.appendChild(searchInput);

//     super({
//       element: element,
//       target: options.target,
//     });
//     searchInput.addEventListener("change", function(event) {
//       console.log("The input value has changed: " + event.target.value);
//     });
//     //button.addEventListener('click', this.handleRotateNorth.bind(this), false);
//   }

//   Search() {
//     //this.getMap().getView().setRotation(0);
//   }
// }
// var maptag;
// class TagSearch extends Control {
//   /**
//    * @param {Object} [opt_options] Control options.
//    */
//   constructor(opt_options) {
//     const options = opt_options || {};
    
//     const element = document.createElement('div');
//     const tag_dropdown_select = document.createElement('select');    
//     let defaultOption = document.createElement('option');
//     let option = document.createElement('option');

//     const tagsArray = []
//     jsonObj.forEach(item => {
//       if (item.hasOwnProperty("tags")) {
//         let tags = item.tags.split("|");
//         tagsArray.push(...tags);
//       }
//     });
//     let uniqueTags = [...new Set(tagsArray)]; // use Set to store unique values and convert it to array

//     tag_dropdown_select.setAttribute("id", "tag-dropdown-select");
//     tag_dropdown_select.classList.add("tag-dropdown-select");

//     defaultOption.id = "default-text"
//     defaultOption.value = ""
//     defaultOption.text = "Select tag to filter by"
//     defaultOption.disabled = true;
//     defaultOption.selected = true;
//     tag_dropdown_select.add(defaultOption);

//     element.className = 'tag-dropdown-toggle ol-unselectable ol-control';
    
//     uniqueTags.forEach(tag => {
//       option = document.createElement("option");
//       option.value = tag;
//       option.innerHTML = tag;
//       tag_dropdown_select.appendChild(option);
//     });
    
//     element.appendChild(tag_dropdown_select);

//     super({
//       element: element,
//       target: options.target,
//     });
//     tag_dropdown_select.addEventListener("change", function(event) {
//       console.log("The input value has changed: " + event.target.value);
//       maptag = event.target.value;

//       geojsonObj_filtered = new TagSearch();

//       const vectorSource_filtered = new VectorSource({
//         features: new GeoJSON().readFeatures(geojsonObj_filtered)
//       });
//       // let mapSize = map.getSize()
//       // let filtered_extent = vectorSource_filtered.getExtent()
//       // let filtered_center = getCenter(filtered_extent)
//       // let filtered_res = getResolutionForExtent(filtered_extent, mapSize)
//       // let filtered_zoom = getZoomForResolution(filtered_res)
//       // console.log(filtered_res)
//       // console.log(filtered_extent)
//       // console.log(filtered_center)
//         businessLayer_filtered = new VectorLayer({
//         title: 'Businesses Filtered',
//         style: styleFunction, 
//         visible: true,
//         source: vectorSource_filtered,
//       });
//       view.animate({
//         center: trailandarea, //filtered_center,
//         zoom: 9,
//         duration: 3000,
//       });
//       map.addLayer(businessLayer_filtered)
//       map.removeLayer(businessLayer)
//     });
//   }

//   TagSearch() {
//     console.log(maptag)
//     var filteredTags;
//     filteredTags = geojsonObj.features.filter(function(feature) {
//       if (feature.properties.tags) {
//         return feature.properties.tags.includes(maptag);   
//       } else {
//         console.error("Tags property is not defined in this feature.")
//       }          
//     });
//     return {
//       "type": "FeatureCollection",
//       "features": filteredTags,
//       "crs": {
//         "type": "name",
//         "properties": { "name": "urn:ogc:def:crs:EPSG::3857" }
//       }
//     };
//   }
// }
var business_tag;

//const element = document.createElement('div');
const tag_filter_wrapper = document.getElementById('tag-filter-wrapper')
const tag_dropdown_select = document.createElement('select');    
let defaultOption = document.createElement('option');
let option = document.createElement('option');

const tagsArray = []
jsonObj.forEach(item => {
  if (item.hasOwnProperty("tags")) {
    let tags = item.tags.split("|");
    tagsArray.push(...tags);
  }
});
let uniqueTags = [...new Set(tagsArray)]; // use Set to store unique values and convert it to array

tag_dropdown_select.setAttribute("id", "tag-dropdown-select");
tag_dropdown_select.classList.add("tag-dropdown-select");

defaultOption.id = "default-text"
defaultOption.value = ""
defaultOption.text = "Filter businesses by tag"
defaultOption.disabled = true;
defaultOption.selected = true;
tag_dropdown_select.add(defaultOption);

//element.className = 'tag-dropdown-toggle ol-unselectable ol-control';

uniqueTags.forEach(tag => {
  option = document.createElement("option");
  option.value = tag;
  option.innerHTML = tag;
  tag_dropdown_select.appendChild(option);
});
tag_filter_wrapper.appendChild(tag_dropdown_select)
//element.appendChild(tag_dropdown_select);

tag_dropdown_select.addEventListener("change", function(event) {
  console.log("The input value has changed: " + event.target.value);
  business_tag = event.target.value;
  current_view_values = getValues();
  geojsonObj_filtered = new TagSearch(business_tag);
  let filter_layer = business_tag + " Businesses"
  
  createFilteredSource(geojsonObj_filtered)
  createFilteredLayer(vectorSource_filtered, filter_layer)
  let filtered_extent = vectorSource_filtered.getExtent()
  //filtered_center = getCenter(filtered_extent)

  addFilterLayer(businessLayer_filtered, filtered_extent)
  filterCloser(businessLayer_filtered);
  // buttonFilterCloser(businessLayer_filtered);
});


// class TagClose extends Control {
//   /**
//    * @param {Object} [opt_options] Control options.
//    */
//   constructor(opt_options) {
//     const options = opt_options || {};
    
//     const element = document.createElement('div');
//     const tag_btn = document.createElement('button');
//     tag_btn.setAttribute("id", "tag-clear");
//     tag_btn.innerHTML = "Clear";
//     tag_btn.classList.add("tag-clear");
    
//     element.className = 'tag-clear ol-unselectable ol-control';
//     element.appendChild(tag_btn);

//     super({
//       element: element,
//       target: options.target,
//     });
//     tag_btn.addEventListener("click", function(event) {
//       console.log("The tag clear button has been clicked: " + event.target.value);

//     });
//   }

//   TagClose() {
//     //this.getMap().getView().setRotation(0);
//   }
// }

const map = new Map({
  controls: defaultControls().extend([/*new TagSearch(), new TagClose(), new Search()*/ ]),
  target: 'map',
  layers: [baseMaps, overlays, businessLayer],
  view: view,
  //interactions: defaults({ zoomDuration: 0 })
});

var layerSwitcher = new LayerSwitcher({
  tipLabel: 'Layer Switcher', // Optional label for button
  groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
});
map.addControl(layerSwitcher);
// sync(map); need to import ol-hashed if using

/* *Land Inventory property filters */
// Get the property select and value select elements
var propertySelect = document.getElementById("property1");
var filter_submit_btn = document.getElementById("filter-submit-btn");
var filter_clear_btn = document.getElementById("filter-clear-btn");
var string_label = document.getElementById("string-label");
var string_value = document.getElementById("string-value");
var range_input = document.getElementById("range-input");
var low_number_value = document.getElementById("low-number-value");
var high_number_value = document.getElementById("high-number-value");
var rangeValues = {low: '', high: ''};
var rangeArray;
var string_values_array;

// Extract unique properties from GeoJSON object
let properties = new Set();
geojsonObjWFS.features.forEach(feature => {
  const filterArray = ['pid', 'area_acres', 'zone_name', 'zone_admin', 'services', 'current_use', 'avg_slope', 'development_score_weighted'];

  Object.keys(feature.properties).forEach(property => {
    if(filterArray.includes(property)) {
      properties.add(property);
    } 
  });
});

// Add options to the property select
properties.forEach(property => {
  var option = document.createElement("option");
  option.value = property;
  option.innerHTML = property;
  propertySelect.appendChild(option);
});

// Add event listener to the property select to update the value select
propertySelect.addEventListener("change", function() {
  // Get the selected property
  var selectedProperty = propertySelect.value;
  // Clear the user input values 
  string_value.innerHTML = "";
  low_number_value.innerHTML = "";
  high_number_value.innerHTML = "";

  // Extract unique values for selected property from GeoJSON object
  let values = new Set();
  geojsonObjWFS.features.forEach(feature => {
    if(feature.properties[selectedProperty]) 
      values.add(feature.properties[selectedProperty]);
  });
  // Add options to the value select
  values.forEach(value => {
    if (typeof value === 'string') {
      if (range_input.style.display === "block") {
        range_input.style.display = "none"
      }
      var option = document.createElement("option");
      option.value = value;
      option.innerHTML = value;
      string_label.style.display = "block"
      string_value.style.display = "block"
      string_value.appendChild(option);
    } else if (typeof value === 'number') {
        if (string_label.style.display === "block") {
          string_label.style.display = "none"
          string_value.style.display = "none"
        }
      rangeArray = values;
      range_input.style.display = "block"
      // sort array to extract low and high value
      let sortedNumbers = [...values].slice().sort((a, b) => a - b);
      // round decimal values to 4 places
      let roundedNumbers = sortedNumbers.map(number => Math.round(number * 10000) / 10000);
      //calculate decimal length to be used to change input increment
      let decimalLength;
      if(Number.isInteger(roundedNumbers[0])) {
        decimalLength = 0;
      } else {  
        decimalLength = (roundedNumbers[0]).toString().split(".")[1].length;
      } 
      // convert decimal length to increment value
      let placeholder = 1 
      let incrementor = placeholder / Math.pow(10, decimalLength)
      //set increment value for input arrows
      low_number_value.step = incrementor;
      high_number_value.step = incrementor;
      //set low and high values of array
      low_number_value.value = roundedNumbers[0];
      high_number_value.value = roundedNumbers[sortedNumbers.length - 1];
      rangeValues = {low: roundedNumbers[0], high: roundedNumbers[sortedNumbers.length - 1]}
      //event listeners for retrieving low and high values
      low_number_value.addEventListener("change", function() {
        rangeValues.low = low_number_value.valueAsNumber;
      });
      high_number_value.addEventListener("change", function() {
        rangeValues.high = high_number_value.valueAsNumber;
      }); 
    }
  });
});
let filter_title;
let landInvLayer_filtered;
let vectorSourceWFS_filtered;

filter_submit_btn.addEventListener("click", function() {
  geojsonObjWFS_filtered = submitFilter();

  createFilteredSourceInv(geojsonObjWFS_filtered)
  createFilteredLayerInv(vectorSourceWFS_filtered, filter_title)

  let extent = vectorSourceWFS_filtered.getExtent()
  let mapSize = map.getSize()
  view.fit(extent, {
    size: mapSize, 
    padding: [50, 50, 50, 50],
    duration: 3000,
  });

  overlays.getLayers().remove(landInvLayerWFS) 
  overlays.getLayers().push(landInvLayer_filtered)

  filter_clear_btn.addEventListener("click", function() {
    propertySelect.value = "";
    string_value.value = "";
    string_label.style.display = "none"
    string_value.style.display = "none"
    range_input.style.display = "none"
    
    overlays.getLayers().remove(landInvLayer_filtered)
    overlays.getLayers().push(landInvLayerWFS)
  });
});

function submitFilter() {
    var property = propertySelect.value;
    string_values_array = Array.from(string_value.selectedOptions).map(option => option.value);
    var filteredFeatures;
    // console.log(filterValues)
    
    if (typeof string_values_array[0] === 'string') {
      filter_title = `Filtered ${propertySelect.value}<br> = ${string_values_array}`
      filteredFeatures = geojsonObjWFS.features.filter(function(feature) {
        return string_values_array.includes(feature.properties[property]);
      });
    } else {
      filter_title = `Filtered ${propertySelect.value}<br> >= ${rangeValues.low} <= ${rangeValues.high}`
      var filterValues = Array.from(rangeArray).filter(val => val >= rangeValues.low && val <= rangeValues.high);
      filteredFeatures = geojsonObjWFS.features.filter(function(feature) {
        return filterValues.includes(feature.properties[property]);
      });
    }
    console.log(filteredFeatures)
    return {
      "type": "FeatureCollection",
      "features": filteredFeatures,
      "crs": {
        "type": "name",
        "properties": { "name": "urn:ogc:def:crs:EPSG::3857" }
      }  
    }  
};

// const wmsSource = new ImageWMS({
//   url: 'http://51.79.71.43:8080/geoserver/wms',
//   params: {'LAYERS': 'LCICLandInventory:Land Inventory WMS'},
//   ratio: 1,
//   serverType: 'geoserver',
// });

let imageCache = {}
function styleFunction (feature, resolution) {
  // console.log(resolution)
  const resolutionThreshold_1 = 30;
  const resolutionThreshold_2 = 1.1;
  const resolutionThreshold_3 = 0.9;
  const markerSource = markerURL; 
 
  var iconSource1 = feature.get('image60x60');
  var iconSource2 = feature.get('image120x120');

  var markerStyle = new Style({
    image: markerSource ? new Icon({
      src: markerSource,
      scale: 1
    }) : undefined
  });

  var iconStyle1, iconStyle2, iconStyle3;

  if (iconSource1 in imageCache) {
    iconStyle1 = imageCache[iconSource1];
  } else {
    iconStyle1 = new Style({
    image: new Icon({
    src: iconSource1,
    scale: 0.6,
    })
  });
  imageCache[iconSource1] = iconStyle1;
  }
  iconStyle2 = new Style({
    image: iconSource1 ? new Icon({
      src: iconSource1,
      scale: 0.7/Math.pow(resolution, 1/2),
      maxCacheSize: 500,
      imageLoadFunction: function(image) {
        imageCache[iconSource1] = image;
      },
    }) : undefined
  });
  iconStyle3 = new Style({
    image: iconSource2 ? new Icon({
      src: iconSource2,
      scale: 0.4/Math.pow(resolution, 1/2),
      maxCacheSize: 500,
      imageLoadFunction: function(image) {
        imageCache[iconSource2] = image;
      },
    }) : undefined
  });

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
let symbolValue = feature.get('development_score_weighted');
const transparency = 0.4;
// use RampGen https://www.rampgenerator.com/
const fillColors = ['215, 25, 28,', '229, 79, 53,', '243, 133, 78,', '253, 181, 106,', '254, 211, 140,', '255, 240, 175,', '239, 248, 176,', '206, 234, 145,', '174, 220, 114,', '128, 199, 95,', '77, 174, 80,', '26, 150, 65,']
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
  if (symbolValue >= 8 && symbolValue <= 19) {
    return [styles[symbolValue - 8]];
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

      if (geometryType === 'Point'){
        pointPopupContent(feature);
      } 
      else if (geometryType === 'MultiPolygon') {
        multipolyPopupContent(feature);
      } 
      // else if (geometryType === 'MultiPolygon') {
      //   WMSPopup (evt);
      // }
    }
});

// Function for creating content for point feature
function pointPopupContent(feature) {
  var geometry = feature.getGeometry();
  var point_coord = geometry.getCoordinates();
  var content = `
    <h2> ${feature.get('label')} </h2>
    <h5 id=popup-category >CATEGORY - ${feature.get('category')}</h5>
    <h5 id=popup-website ><a href= ${feature.get('website')}> ${feature.get('label')}</a></h5>
    <h5 id=popup-email><a href=mailto: ${feature.get('email')}> ${feature.get('email')}</a></h5>
    <h5 id=popup-phone><a href=tel: ${feature.get('phone')}>${feature.get('phone')}</a></h5>
    <h5 id=popup-address>${feature.get('address')}</h5>
    <hr class=rounded >
    <h5 id=popup-description>${feature.get('description')}</h5>
  `;
  content_element.innerHTML = content;
  overlay.setPosition(point_coord);
}

// Function for creating content for multipolygon feature
function multipolyPopupContent(feature) {
  var geometry = feature.getGeometry();
  var extent = geometry.getExtent()
  var poly_coord = olExtent.getCenter(extent);
  var area_acres = feature.get('area_acres');
  var rounded_area_acres = area_acres.toFixed(4);
  var avg_slope = feature.get('avg_slope');
  var rounded_avg_slope = avg_slope.toFixed(2);
  var content = `
    <h2 id= popup-pid class= landInv>PID - ${feature.get('pid')}</h2>
    <h5 id=popup-shape-area class= landInv>AREA (acres) - ${rounded_area_acres}</h5>
    <h5 id=popup-zone-name class= landInv>ZONE - ${feature.get('zone_name')}</h5>
    <h5 id=popup-zone-admin class= landInv>ZONE ADMINISTRATION - ${feature.get('zone_admin')}</h5>
    <h5 id=popup-current-use class= landInv>CURRENT USAGE - ${feature.get('current_use')}</h5>
    <h5 id=popup-services class= landInv>SERVICES - ${feature.get('services')}</h5>
    <h5 id=popup-avg-slope class= landInv>AVERAGE SLOPE - ${rounded_avg_slope}</h5>
    <h5 id=popup-development-score-weighted class= landInv>DEVELOPMENT SCORE (Weighted) - ${feature.get('development_score_weighted')}</h5>  
  `;
  content_element.innerHTML = content;
  overlay.setPosition(poly_coord);

  //console.info(feature.getProperties());
}

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
const filter_businessATT_jsonObj = [];
jsonObj.forEach((item)=>{
  const selectedFields = ['label', 'category', 'website', 'email', 'phone', 'address', 'region', 'description', 'tags']
  const arr = Object.keys(item)
  .filter((key) => selectedFields.includes(key))
  .reduce((obj, key) => {
    obj[key] = item[key];
    return obj;
  }, {});
  filter_businessATT_jsonObj.push(arr);
});
//console.log(filter_businessATT_jsonObj); 

/* ****function to create and populate business feature**** */
var filter_toggle = false;
let filtered_center;
for (let i =0; i < filter_businessATT_jsonObj.length; i++) {  
  // replace character delimiters
  let tags = filter_businessATT_jsonObj[i].tags; tags = tags.split("|");
  let attributes = document.getElementById('attributes');
  let table = document.createElement("table");
  table.id = 'table-' + [i]; 
  table.classList.add('hidden');
  attributes.appendChild(table);
  
  for(let attribute in filter_businessATT_jsonObj[i]) {  
    let tr = document.createElement("tr"); 
    let th = document.createElement("th");
    let td = document.createElement("td");
    let a = document.createElement("a");
   
    if (attribute != 'label') {
      th.id = attribute; th.innerText = attribute;
      td.id = attribute + '-value';
      
      if (th.id === 'category') {
        td.innerText = filter_businessATT_jsonObj[i].category;
      } 
      else if (th.id === 'website') {
        a.id = attribute + '-innerValue';
        a.setAttribute("href", filter_businessATT_jsonObj[i].website);
        a.innerText = filter_businessATT_jsonObj[i].label;
        td.appendChild(a);
      }
      else if (th.id === 'email') {
        a.id = attribute + '-innerValue';
        a.setAttribute("href", "mailto:" + filter_businessATT_jsonObj[i].email);
        a.innerText = filter_businessATT_jsonObj[i].email;
        td.appendChild(a);
      }
      else if (th.id === 'phone') {
        a.id = attribute + '-innerValue';
        a.setAttribute("href", "tel:" + filter_businessATT_jsonObj[i].phone);
        a.innerText = filter_businessATT_jsonObj[i].phone;
        td.appendChild(a);
      }
      else if (th.id === 'address') {
        td.innerText = filter_businessATT_jsonObj[i].address;
      }
      else if (th.id === 'region') {
        td.innerText = filter_businessATT_jsonObj[i].region;
      }
      else if (th.id === 'description') {
        td.innerText = filter_businessATT_jsonObj[i].description;
      };
      // create buttons from tags (add filter function later)
      if (th.id == 'tags') {
        tags.forEach(function (tag, index) {
          let tagButton = document.createElement('button');
          tagButton.id = `tag_${tag}_${index}`; 
          tagButton.className = "tags";
          tagButton.innerHTML = tag;
          tagButton.value = tag;
          td.appendChild(tagButton);
          
          /** Tag Filter */
          tagButton.addEventListener("click", function(event) {
            console.log("A tag value has changed: " + event.target.value);
            business_tag = event.target.value;
            let buttonId = event.target.id;
            geojsonObj_filtered = TagSearch(business_tag);
            let filter_layer = business_tag + " Businesses"
            // toggleTagFilter()
            createFilteredSource(geojsonObj_filtered)
            createFilteredLayer(vectorSource_filtered, filter_layer)
            
            let filtered_extent = vectorSource_filtered.getExtent()
            filtered_center = getCenter(filtered_extent)
            console.log(filter_toggle)
          });
         });    
       };
     };
    tr.appendChild(th);
    tr.appendChild(td);
    table.appendChild(tr); 
  };
};

// function addTagFilter (id) {
//   id.classList.add("active");
//   addFilterLayer(businessLayer_filtered, filtered_center)
//   filter_toggle = true;
// }  
// function removeTagFilter (id) {
//   id.classList.remove("active");
//   removeFilterLayer(businessLayer_filtered)
//   filter_toggle = false;
// }
// function toggleTagFilter(id, layer) {
//   filter_toggle ? removeTagFilter(id, layer) : addTagFilter(id, layer)
// }

function TagSearch(tag) {
  var filteredTags;
  filteredTags = geojsonObj.features.filter(function(feature) {
    if (feature.properties.tags) {
      return feature.properties.tags.includes(tag);   
    } else {
      console.error("Tags property is not defined in this feature.")
    }          
  });
  return {
    "type": "FeatureCollection",
    "features": filteredTags,
    "crs": {
      "type": "name",
      "properties": { "name": "urn:ogc:def:crs:EPSG::3857" }
    }
  };
}
// function buttonFilterCloser (id, layer) {
//   var tag_filter_closer = document.getElementById('tag-filter-closer');
//   tag_filter_closer.addEventListener("click", function() {
//     removeTagFilter(id, layer)
//   });
// }
function filterCloser (layer) {
  var tag_filter_closer = document.getElementById('tag-filter-closer');
  tag_filter_closer.addEventListener("click", function() {
    document.getElementById("tag-dropdown-select").selectedIndex = 0;
    removeFilterLayer(layer)
  });
}
function addFilterLayer (filteredLayer, extent) {
  //console.log(filteredLayer)
  businessLayer.setVisible(false)
  map.getLayers().push(filteredLayer)
  let mapSize = map.getSize()
  view.fit(extent, {
    size: mapSize, 
    padding: [50, 50, 50, 50],
    duration: 3000,
  });
}
function removeFilterLayer(filteredLayer) {
  console.log(filteredLayer)
  map.getLayers().remove(filteredLayer)
  businessLayer.setVisible(true)
  view.animate({
    center: current_view_values.currentCenter, 
    zoom: current_view_values.currentZoom,
    duration: 1000,
  });
}
function createFilteredLayerInv(source, title) {
  landInvLayer_filtered = new VectorLayer({
    title: title,
    style: styleFunction2, 
    visible: true,
    source: source,
  });
  return landInvLayer_filtered;
}
function createFilteredSourceInv(filteredSource) {
  vectorSourceWFS_filtered = new VectorSource({
    features: new GeoJSON().readFeatures(filteredSource)
  });
  return vectorSourceWFS_filtered;
}
function createFilteredLayer(source, title) {
  businessLayer_filtered = new VectorLayer({
    title: title,
    style: styleFunction, 
    visible: true,
    source: source,
  });
  return businessLayer_filtered;
}
function createFilteredSource(filteredSource) {
  vectorSource_filtered = new VectorSource({
    features: new GeoJSON().readFeatures(filteredSource)
  });
  return vectorSource_filtered;
}

/* dynamically created DOM element selections */
const groupItems = document.querySelector('#groups');
const regionItems = document.querySelectorAll('.regions > a > span');
const listItems = document.querySelectorAll('.business');

// toggles regional business list open/closed
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

// opens business attribute pane and zooms to business
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
          constrainResolution:true
        });
      }
      // If element has no id
      else { 
          console.log("An element without an id was clicked.");
      }
    });  
  });
};

// slides left panel closed or toggles panel open
function hideList() {
    // Update container size, timeout must match or exceed css transition for list pane closing
    setTimeout(function () {
      map.updateSize();
    }, 500)
    wrapper.classList.toggle('no-list');
};

// hides feature attribute list and shows main business list and zooms back out to previous position
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
      constrainResolution: true
    });
  }
  // If element has no id
  else { 
      console.log("An element without an id was hovered.");
  }
};



/* **** Filter land inventory functions **** */

// function to open filter pane
let filter_pane = document.getElementById("filter-pane");
let filter_button = document.getElementById("filter-button");
let filter_closer = document.getElementById('filter-closer');
//let filter_submit_btn = document.getElementById('filter-submit-btn');

filter_button.addEventListener('click', openFilterPane);
filter_closer.addEventListener('click', closeFilterPane);

function openFilterPane() {  
  FeatureList.style.display = "none";
  List.style.display = "none";
  filter_pane.style.display = "block"; 
};
// function to close filter pane
function closeFilterPane() {
  List.style.display = "flex"; 
  filter_pane.style.display = "none";
}

/* *** utilization button and pane *** */
const utilization = document.getElementById("utilization");
const uti_button = document.getElementById("uti-button");
const uti_closer = document.getElementById("uti-closer");

uti_button.addEventListener("click", function() {  
  if (utilization.style.display === "block") {
    utilization.style.display = "none";
  } else {
    utilization.style.display = "block";
  }
});
uti_closer.addEventListener("click", function() {  
  if (utilization.style.display === "block") {
    utilization.style.display = "none";
  } else {
    utilization.style.display = "block";
  }
});

/* *** Legend button and pane *** */
const legend_wrapper = document.getElementById("legend-wrapper");
const legend_button = document.getElementById("legend-button");
const legend_closer = document.getElementById("legend-closer");
const fontName = 'Comfortaa';
const fontColor = '8e8d8d';
const fontSize = '7';
const fontStyle = 'bold';
const bgColor = '000000';

legend_button.addEventListener("click", function() {  
  if (legend_wrapper.classList.contains("hidden")) {
    legend_wrapper.classList.remove("hidden");
  } else {
    legend_wrapper.classList.add("hidden");
  }
});
legend_closer.addEventListener("click", function() {  
    legend_wrapper.classList.add("hidden");
});

function legend() {
  var src = document.getElementById("legend");
  let getLegendWMS = `${geoServerDomain}wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=10&HEIGHT=10&LAYER=${nameSpace}:${layerName}&legend_options=fontName:${fontName};fontAntiAliasing:true;fontColor:0x${fontColor};fontSize:${fontSize};fontStyle:${fontStyle};bgColor:0x${bgColor};dpi:180;`;
  var img = new Image();
  img.src = getLegendWMS;
  src.appendChild(img);
}
legend();
map.getView().on("change:resolution", function() {
  let resolution = map.getView().getResolution();
  let coordinates = map.getView().getCenter()
  let inventoryCenter = [-117.66993534984215, 49.100971359691975]
  let latLong = toLonLat(coordinates)
  // console.log(coordinates)
  // console.log(inventoryCenter)
  // console.log(latLong)
  // const line = new LineString(latLong, inventoryCenter);
  // console.log(line)
  // const distance = line.getLength()
  // console.log(distance)
  if (resolution > 80) {
    legend_wrapper.classList.add("hidden");
  } else {
    legend_wrapper.classList.remove("hidden");
  }

  document.addEventListener("change", function() {
  console.log(landInvLayerWFS.getVisible())
  if (landInvLayerWFS.getVisible() === false && resolution > 80 ){
    legend_wrapper.classList.add("hidden");
  } else if (landInvLayerWFS.getVisible() === true && resolution < 80){
    legend_wrapper.classList.remove("hidden");
  }
  });
});

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
  // console.log(viewValues);
  return viewValues;
};
// window.onresize = function()
// {
//   setTimeout( function() { map.updateSize();}, 300);
// }
// });