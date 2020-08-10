import { getFeatures } from "./features.js";
mapboxgl.accessToken = token;
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/light-v10",
  center: [-96.36617, 30.6349], // starting position
  zoom: 11, // starting zoom
});
// get the user location
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })
);

// add navigation toolkit
var nav = new mapboxgl.NavigationControl();
var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: "metric",
  profile: "mapbox/driving",
  alternatives: "true",
  geometries: "geojson",
});
map.scrollZoom.enable();
map.addControl(directions, "top-right");

// Prepare the flooding area
var clearances = getFeatures();
var obstacle = turf.buffer(clearances, 0.25, { units: "kilometers" });

map.on("load", function (e) {
  // Display the flooding area
  map.addLayer({
    id: "clearances",
    type: "fill",
    source: {
      type: "geojson",
      data: obstacle,
    },
    layout: {},
    paint: {
      "fill-color": "#3887be",
      "fill-opacity": 0.5,
      "fill-outline-color": "#f03b20",
    },
  });

  // Create sources and layers for the returned routes.
  // There will be a maximum of 5 results from the Directions API. use a loop to create the sources and layers.
  for (let i = 0; i <= 5; i++) {
    map.addSource("route" + i, {
      type: "geojson",
      data: {
        type: "Feature",
      },
    });

    // the sources and layers will be used to draw th routes on the maps
    map.addLayer({
      id: "route" + i,
      type: "line",
      source: "route" + i,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#cccccc",
        "line-opacity": 0.5,
        "line-width": 13,
        "line-blur": 0.5,
      },
    });
  }
});

// check out the routes for collisions
directions.on("route", (e) => {
  var reports = document.getElementById("reports");
  reports.innerHTML = "";
  var report = reports.appendChild(document.createElement("div"));
  let routes = e.route;
  console.log(e);

  //Hide all routes by setting the opacity to zero.
  for (let i = 0; i <= 5; i++) {
    map.setLayoutProperty("route" + i, "visibility", "none");
  }

  //   add id to routes, allow me reference each route using the id
  routes.forEach(function (route, i) {
    route.id = i;
  });

  routes.forEach((e) => {
    //Make each route visible, by setting the opacity to 50%.
    map.setLayoutProperty("route" + e.id, "visibility", "visible");

    //Get GeoJson LineString feature of route
    var routeLine = polyline.toGeoJSON(e.geometry);

    //Update the data for the route, updating the visual.
    map.getSource("route" + e.id).setData(routeLine);

    var collision = "";
    var emoji = "";
    // check the collision
    var clear = turf.booleanDisjoint(obstacle, routeLine);
    var detail = "";

    if (clear == true) {
      collision = "is good!";
      detail = "does not go";
      emoji = "✔️";
      report.className = "item";
      map.setPaintProperty("route" + e.id, "line-color", "#74c476");
    } else {
      collision = "is bad.";
      detail = "goes";
      emoji = "⚠️";
      report.className = "item warning";
      map.setPaintProperty("route" + e.id, "line-color", "#de2d26");
    }

    //Add a new report section to the sidebar.
    // Assign a unique `id` to the report.
    report.id = "report-" + e.id;

    // Add the response to the individual report created above.
    var heading = report.appendChild(document.createElement("h3"));

    // Set the class type based on clear value.
    if (clear == true) {
      heading.className = "title";
    } else {
      heading.className = "warning";
    }

    heading.innerHTML = emoji + " Route " + (e.id + 1) + " " + collision;

    // Add details to the individual report.
    var details = report.appendChild(document.createElement("div"));
    details.innerHTML = "This route " + detail + " through an avoidance area.";
    report.appendChild(document.createElement("hr"));
  });
});
