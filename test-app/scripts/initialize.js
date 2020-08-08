export function init(startLocation) {
  // Add your access token
  mapboxgl.accessToken = token;

  // Initialize a map
  var map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/mapbox/light-v10", // stylesheet location
    center: startLocation, // starting position
    zoom: 12, // starting zoom
  });

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
  );

  console.log("Initialization finished");
  return map;
}


