import { init } from "./initialize.js";
import { loadMarker } from "./marker.js";
import { addWareHouse } from "./layer.js";
let map = init();
var startLocation = [-83.093, 42.376];
var warehouseLocation = [-83.083, 42.363];
var lastQueryTime = 0;
var lastAtRestaurant = 0;
var keepTrack = [];
var currentSchedule = [];
var currentRoute = null;
var pointHopper = {};
var pause = true;
var speedFactor = 50;
loadMarker(map, startLocation);

// Create a GeoJSON feature collection for warehouse
var warehouse = turf.featureCollection([turf.point(warehouseLocation)]);
addWareHouse(map, warehouse)