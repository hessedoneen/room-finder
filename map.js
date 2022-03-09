// Initialize and add the map
function initMap() {
  // The location of GG Brown
  const gg_brown = { lat: 42.29333057762535, lng: -83.71384208374704 };
  // The map, centered at GG Brown
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: gg_brown,
  });
  // The marker, positioned at GG Brown
  const marker = new google.maps.Marker({
    position: gg_brown,
    map: map,
  });
}

// let image = 

/* OVERLAY MAP */
/**
   * The custom USGSOverlay object contains the USGS image,
   * the bounds of the image, and a reference to the map.
   */
class USGSOverlay extends google.maps.OverlayView {
  bounds;
  image;
  div;
  constructor(bounds, image) {
    super();
    this.bounds = bounds;
    this.image = image;
  }
  /**
   * onAdd is called when the map's panes are ready and the overlay has been
   * added to the map.
   */
  onAdd() {
    this.div = document.createElement("div");
    this.div.style.borderStyle = "none";
    this.div.style.borderWidth = "0px";
    this.div.style.position = "absolute";

    // Create the img element and attach it to the div.
    const img = document.createElement("img");

    img.src = this.image;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.position = "absolute";
    this.div.appendChild(img);

    // Add the element to the "overlayLayer" pane.
    const panes = this.getPanes();

    panes.overlayLayer.appendChild(this.div);
  }
  draw() {
    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    const overlayProjection = this.getProjection();
    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    const sw = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getSouthWest()
    );
    const ne = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getNorthEast()
    );

    // Resize the image's div to fit the indicated dimensions.
    if (this.div) {
      this.div.style.left = sw.x + "px";
      this.div.style.top = ne.y + "px";
      this.div.style.width = ne.x - sw.x + "px";
      this.div.style.height = sw.y - ne.y + "px";
    }
  }

}


