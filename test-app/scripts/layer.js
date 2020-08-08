export function addWareHouse(map, obj) {
  // Create a circle layer
  map.addLayer({
    id: "warehouse",
    type: "circle",
    source: {
      data: obj,
      type: "geojson",
    },
    paint: {
      "circle-radius": 20,
      "circle-color": "white",
      "circle-stroke-color": "#3887be",
      "circle-stroke-width": 3,
    },
  });

  // Create a symbol layer on top of circle layer
  map.addLayer({
    id: "warehouse-symbol",
    type: "symbol",
    source: {
      data: obj,
      type: "geojson",
    },
    layout: {
      "icon-image": "grocery-15",
      "icon-size": 1,
    },
    paint: {
      "text-color": "#3887be",
    },
  });
}
