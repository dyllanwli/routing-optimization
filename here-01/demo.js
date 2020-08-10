
const x1 = 30.640896
const y1 = -96.370344
const x2 = 30.637099
const y2 = -96.356389
// console.log([x1,y1,x2,y2].join())
function calculateRouteFromAtoB(platform) {
  var router = platform.getRoutingService(null, 8),
    routeRequestParams = {
      routingMode: "fast",
      transportMode: "car",
      origin: "30.649768,-96.36626",
      destination: "30.62734,-96.36209",
      'avoid[areas]': 
        "bbox:"+[x1,y1,x2,y2].join().toString()
    ,
      return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
    };

  // call back to on Success or on Error
  router.calculateRoute(routeRequestParams, onSuccess, onError);
}

function onSuccess(result) {
  console.log(result);
  var route = result.routes[0];

  addRouteShapeToMap(route);
  addManueversToMap(route);
  addWaypointsToPanel(route);
  addManueversToPanel(route);
  addSummaryToPanel(route);
  // ... etc.
}

function onError(error) {
  alert("Can't reach the remote server");
}

function drawAreas(map) {
  var firstArea = new H.map.Rect(new H.geo.Rect(x1,y1,x2,y2));
  
  map.addObject(firstArea);
}

// set up containers for the map  + panel
var mapContainer = document.getElementById("map"),
  routeInstructionsContainer = document.getElementById("panel");

//Step 1: initialize communication with the platform
var platform = new H.service.Platform({
  apikey: token,
});

var defaultLayers = platform.createDefaultLayers();

//Step 2: initialize a map - this map is centered over Berlin
var map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
  center: { lat: -96.36626, lng: 30.64976 },
  zoom: 13,
  pixelRatio: window.devicePixelRatio || 1,
});

// add avoidance
drawAreas(map)

// add a resize listener to make sure that the map occupies the whole container
window.addEventListener("resize", () => map.getViewPort().resize());

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Hold a reference to any infobubble opened
var bubble;

/**
 * Opens/Closes a infobubble
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text) {
  if (!bubble) {
    bubble = new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      { content: text }
    );
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route) {
  route.sections.forEach((section) => {
    // decode LineString from the flexible polyline
    let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

    // Create a polyline to display the route:
    let polyline = new H.map.Polyline(linestring, {
      style: {
        lineWidth: 4,
        strokeColor: "rgba(0, 128, 255, 0.7)",
      },
    });

    let routeArrows = new H.map.Polyline(linestring, {
      style: {
        lineWidth: 10,
        fillColor: "white",
        strokeColor: "rgba(255, 255, 255, 1)",
        lineDash: [0, 2],
        lineTailCap: "arrow-tail",
        lineHeadCap: "arrow-head",
      },
    });

    // Add the polyline to the map
    map.addObject(polyline);
    // And zoom to its bounding rectangle
    map.getViewModel().setLookAtData({
      bounds: polyline.getBoundingBox(),
    });
  });
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route) {
  var svgMarkup =
      '<svg width="18" height="18" ' +
      'xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"  />' +
      "</svg>",
    dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
    group = new H.map.Group(),
    i,
    j;
  route.sections.forEach((section) => {
    let poly = H.geo.LineString.fromFlexiblePolyline(
      section.polyline
    ).getLatLngAltArray();

    let actions = section.actions;
    // Add a marker for each maneuver
    for (i = 0; i < actions.length; i += 1) {
      let action = actions[i];
      var marker = new H.map.Marker(
        {
          lat: poly[action.offset * 3],
          lng: poly[action.offset * 3 + 1],
        },
        { icon: dotIcon }
      );
      marker.instruction = action.instruction;
      group.addObject(marker);
    }

    group.addEventListener(
      "tap",
      function (evt) {
        map.setCenter(evt.target.getGeometry());
        openBubble(evt.target.getGeometry(), evt.target.instruction);
      },
      false
    );

    // Add the maneuvers group to the map
    map.addObject(group);
  });
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addWaypointsToPanel(route) {
  var nodeH3 = document.createElement("h3"),
    labels = [];

  route.sections.forEach((section) => {
    labels.push(section.turnByTurnActions[0].nextRoad.name[0].value);
    labels.push(
      section.turnByTurnActions[section.turnByTurnActions.length - 1]
        .currentRoad.name[0].value
    );
  });

  nodeH3.textContent = labels.join(" - ");
  routeInstructionsContainer.innerHTML = "";
  routeInstructionsContainer.appendChild(nodeH3);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(route) {
  let duration = 0,
    distance = 0;

  route.sections.forEach((section) => {
    distance += section.travelSummary.length;
    duration += section.travelSummary.duration;
  });

  var summaryDiv = document.createElement("div"),
    content = "";
  content += "<b>Total distance</b>: " + distance + "m. <br/>";
  content +=
    "<b>Travel Time</b>: " + duration.toMMSS() + " (in current traffic)";

  summaryDiv.style.fontSize = "small";
  summaryDiv.style.marginLeft = "5%";
  summaryDiv.style.marginRight = "5%";
  summaryDiv.innerHTML = content;
  routeInstructionsContainer.appendChild(summaryDiv);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToPanel(route) {
  var nodeOL = document.createElement("ol");

  nodeOL.style.fontSize = "small";
  nodeOL.style.marginLeft = "5%";
  nodeOL.style.marginRight = "5%";
  nodeOL.className = "directions";

  route.sections.forEach((section) => {
    section.actions.forEach((action, idx) => {
      var li = document.createElement("li"),
        spanArrow = document.createElement("span"),
        spanInstruction = document.createElement("span");

      spanArrow.className = "arrow " + (action.direction || "") + action.action;
      spanInstruction.innerHTML = section.actions[idx].instruction;
      li.appendChild(spanArrow);
      li.appendChild(spanInstruction);

      nodeOL.appendChild(li);
    });
  });

  routeInstructionsContainer.appendChild(nodeOL);
}

Number.prototype.toMMSS = function () {
  return Math.floor(this / 60) + " minutes " + (this % 60) + " seconds.";
};

// Now use the map as required...
calculateRouteFromAtoB(platform);
