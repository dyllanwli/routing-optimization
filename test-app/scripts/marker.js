export function loadMarker(map, startLocation) {
  map.on("load", function () {
    var marker = document.createElement("div");
    marker.classList = "truck";

    // Create a new marker
    truckMarker = new mapboxgl.Marker(marker)
      .setLngLat(startLocation)
      .addTo(map);
  });
}
