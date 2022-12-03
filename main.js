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
import { intersectsSegment } from 'ol/extent';
import XYZ from 'ol/source/XYZ';


const opensheet = "https://opensheet.elk.sh/19o_WmjjKn1ZE1940Brh9VrD9gaTyStMTF-kwbz2LJm4/elements"
const basemapUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'

// Region center Coords
const britishcolumbia = fromLonLat([-118.27998, 49.75215])
const westkootenay = fromLonLat([-117.58374303482402, 49.34945272204586])
const trailandarea = fromLonLat([-117.66993534984215, 49.100971359691975])
const castlegarandarea = fromLonLat([-117.62051713085089, 49.312790603205])
const nelsonandarea = fromLonLat([-117.2900500026088, 49.487387788103334])
const rosslandandarea = fromLonLat([-117.80493087932007, 49.078833201701485])

const regions = [
  {region:'British Columbia', id: 0, coords: britishcolumbia, zoom: 8.5},
  {region:'West Kootenay', id: 1, coords: westkootenay, zoom: 9},
  {region:'Trail and Area', id: 2, coords: trailandarea, zoom: 11.5},
  {region:'Castlegar and Area', id: 3, coords: castlegarandarea, zoom: 13},
  {region:'Nelson and Area', id: 4, coords: nelsonandarea, zoom: 14},
  {region:'Rossland and Area', id: 5, coords: rosslandandarea, zoom: 15}
]

// data    
const jsonObj = await getData();

async function getData() {
  return fetch(opensheet)
  .then(res => res.json())
}
console.log(jsonObj) 

let jsonString = JSON.stringify(jsonObj);
console.log(jsonString);

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
console.log(pointArrFeatureCollection);
console.log(geojsonString);

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
  center: britishcolumbia,
  zoom: 8.5,
  minZoom: 2,
  maxZoom: 20
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
  var markerSource = 'https://marktrueman.ca/wp-content/uploads/2022/12/mtaMarker_blk.png' // 'images/mtaMarker_blk.png'
  var iconSource = feature.get('image');
  var iconStyle = new Style({
      image: iconSource ? new Icon({
        src: iconSource,
        scale: 0.01
      }) : undefined
    });
  var markerStyle = new Style({
    image: markerSource ? new Icon({
      src: markerSource,
      scale: 0.15
    }) : undefined
  })
  if (styleZoom < 11) {
    return [markerStyle];
  }
  else {
    return [iconStyle];
  }
}

// popup
var
    container = document.getElementById('popup'),
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
        content += '<h5>' + feature.get('Website') + '</h5>';
        content += '<h5>' + feature.get('email') + '</h5>';
        content += '<h5>' + feature.get('phone') + '</h5>';
        content += '<h5>' + feature.get('address') + '</h5>';
        content += '<h5>' + "Category - " + feature.get('category') + '</h5>';
        content += '<h5>' + feature.get('description') + '</h5>';

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

let groups = document.getElementById("groups");
let List = document.getElementById('list');
let FeatureList = document.getElementById("feature-list");

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

document.getElementById('list-toggle').addEventListener('click', hideList);

function hideList() {
    // Update container size, timeout must match or exceed css transition for list pane closing
    setTimeout(function () {
      map.updateSize();
    }, 500)
    document.getElementById('wrapper').classList.toggle('no-list');
    
};

document.getElementById('feature-closer').addEventListener('click', showList);

function showList() {
  FeatureList.style.display = "none";
  List.style.display = "block"; 
  view.animate({
    center: current_view_values.currentCenter, 
    zoom: current_view_values.currentZoom,
    duration: 1000,
  });
};

const groupItems = document.querySelector('#groups');

const toggle_1Id = await toggle_businessList();
//console.log(toggle_1Id);
let fieldHeadings = Object.keys(jsonObj[0]);
console.log('headings ' + fieldHeadings);

async function toggle_businessList() {
  groupItems.addEventListener('click', (e) => 
  {
    console.log(e.target.id);
    let ul = "ul_" + e.target.id;
    let img = e.target.id;
    console.log(ul);
    console.log(img);
    let ulElement = document.getElementById(ul);
    console.log(ulElement);
    let imgElement = document.getElementById(img);
    console.log(imgElement)
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

const listItems = document.querySelectorAll('.business');

const regionItems = document.querySelectorAll('.regions > a > span');

const elementId = await listClick();
async function listClick() {
  //var company_values = []
  // Create event listener
  listItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Retrieve id from clicked element
      let eleId = e.target.id;
      // retrieve longitude from json using ID
      let coordX = jsonObj[eleId].longitude;
      // retrieve latitude from json using ID
      let coordY = jsonObj[eleId].latitude;
      // convert coords from lat-long to UTM
      let coords = fromLonLat([coordX, coordY])
      // replace character delimiters
      let tags = jsonObj[eleId].tags;
      
      // elementID variables
      let business = document.getElementById('business');
      let companyIcon = document.getElementById('companyIcon');
      let category_value = document.getElementById('category-value');
      let web_value = document.getElementById('web-value');
      let email_value = document.getElementById('email-value');
      let phone_value = document.getElementById('phone-value');
      let address_value = document.getElementById('address-value');
      let region_value = document.getElementById('region-value');
      let description_value = document.getElementById('description-value');
      let tags_value = document.getElementById('tags-value');

      e.target.classList.add('active');

      if (item.classList.contains('active')){
        item.removeEventListener('mouseleave', zoomToLast);
      }
      while(tags.indexOf("|") >= 0) {
        tags = tags.replace("|", " ")
      }

      // If element has id, build company info pane based on id 
      if (eleId !== '') {
        //company_values = getValues();
        List.style.display = "none";
        FeatureList.style.display = "block";
        business.innerText = jsonObj[eleId].label;
        companyIcon.src = jsonObj[eleId].image;
        category_value.innerText = jsonObj[eleId].category;
        web_value.href = jsonObj[eleId].Website;
        web_value.innerText = jsonObj[eleId].label;
        email_value.href = 'mailto:' + jsonObj[eleId].email;
        email_value.innerText = jsonObj[eleId].email;
        phone_value.href = 'tel:' + jsonObj[eleId].phone;
        phone_value.innerText = jsonObj[eleId].phone;
        address_value.innerText = jsonObj[eleId].address;
        region_value.innerText = jsonObj[eleId].region;
        description_value.innerText = jsonObj[eleId].description;
        tags_value.innerText = tags;
        view.animate({
          center: coords,
          zoom: 16,
          duration:0,
        });
      }
      // If element has no id
      else { 
          console.log("An element without an id was clicked.");
      }
    });  
  });  
};

const elementId1 = await onHover();
// console.log(elementId1);

// holding variable for current mapview
var current_view_values = [];

// Variables for onHover function - outside of function scope as they are shared with zoomToLast()
// delays in milliseconds
let showDelay = 600, hideDelay = 600;
// holding variables for timers
let menuEnterTimer, menuLeaveTimer;

async function onHover() {
  // Create event listener for businesses - does not apply to regional headings
  listItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      // clear the opposite timer
      clearTimeout(menuLeaveTimer);
      // Retrieve id from mouseover element
      let eleId = this.id;
      
      // set time out delay
      menuEnterTimer = setTimeout(function() {
        // retrieve longitude from json using ID
        let coordX = jsonObj[eleId].longitude;
        // retrieve latitude from json using ID
        let coordY = jsonObj[eleId].latitude;
        //convert coords from lat-long to UTM
        let coords = fromLonLat([coordX, coordY])
        
        // class used to control mouseleave onHover() and onClick() 
        item.classList.remove('active');
        
        // get current coords and zoom
        current_view_values = getValues();
    
        // If element has id
        if (eleId !== '') {
          view.animate({
            center: coords,
            zoom: 16,
            duration: 2000,
          });
        }
        // If element has no id
        else { 
            console.log("An element without an id was hovered.");
        } 
        return menuEnterTimer;
      }, showDelay);  
    }, false);

    // mouseleave event listener for businesses
    item.addEventListener('mouseleave', zoomToLast);
  
    // click event listener for groups headings/regions
    regionItems.forEach(item => {
      item.addEventListener('click', regionCLick); 
    });
  });
};

// mouseleave event listener 
function zoomToLast() { 
      // clear the opposite timer
      clearTimeout(menuEnterTimer);
      // remove active class after a delay
      menuLeaveTimer = setTimeout(function() {
        view.animate({
          center: current_view_values.currentCenter, 
          zoom: current_view_values.currentZoom,
          duration: 1000,
        });
      }, hideDelay); 
    }

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

