function getBuilding(query) {
  return query.split(" ")[0];
}

function getRoomNumber(query) {
  return query.split(" ")[1];
}

function getCoordinates(building, room_num) {
  const room_data = JSON.parse(localStorage.getItem('rooms_data'))[room_num];

  const coordinates = {
    'lat': room_data['latitude'],
    'long': room_data['longitude']
  }

  return coordinates;
}

// Initialize map with desired location pinpointed
function initMap() {
  // Get room_num from URL
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const query = urlParams.get('query');
  const building = getBuilding(query);
  const room_num = getRoomNumber(query);

  // Get room coordinates
  const coordinates = getCoordinates(building, room_num)
  const found_lat = coordinates['lat'];
  const found_long = coordinates['long'];

  // Init map with location 
  const latitude = parseFloat(found_lat);
  const longitude = parseFloat(found_long);

  const new_loc = { lat: latitude, lng: longitude };
  // The map, centered at given location
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 20,
    center: new_loc,
    mapId: '1d764dc13899b61e'
  });
  console.log(map.center);
  // The marker, positioned at GG Brown
  const marker = new google.maps.Marker({
    position: new_loc,
    map: map,
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.29279758926315, -83.71516984441227),
    new google.maps.LatLng(42.29405892225341, -83.71278616217957)
  );

  /* IMAGE OVERLAY */
  let image = 'GGB_2nd_floor_pngfile_squish2.png';

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
  const overlay = new USGSOverlay(bounds, image);

  overlay.setMap(map);

  const toggleButton = document.createElement("button");


  toggleButton.textContent = "Search";
  toggleButton.classList.add("custom-map-control-button");


  // onClick return back to search screen (index.html)
  toggleButton.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace('./index.html');

  });

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleButton);
}
