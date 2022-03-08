// Initialize and add the map
function initMap() {
  // The location of GG Brown
  const gg_brown = { lat: 42.29333057762535, lng: -83.71384208374704 };
  // The map, centered at GG Brown
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 20,
    center: gg_brown,
  });
  // The marker, positioned at GG Brown
  const marker = new google.maps.Marker({
    position: gg_brown,
    map: map,
  });
}
  