function parseBuildingName(query) {
  return query.split(" ")[0];
}

function parseRoomNumber(query) {
  return query.split(" ")[1];
}

function getRoomCoordinates() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const query = urlParams.get('query');

  const building = parseBuildingName(query);
  const room_num = parseRoomNumber(query);

  // Get room data (error check whether the room exists)
  const room_data_all = JSON.parse(localStorage.getItem('rooms_data'));
  if (!room_data_all.hasOwnProperty(room_num)) {
    alert("You entered an invalid room number");
    window.location.href = "index.html";
    return;
  } 
  const room_data = room_data_all[room_num];

  localStorage.setItem("building", building);
  localStorage.setItem("room_num", room_num);

  const coordinates = {
    'lat': room_data['latitude'],
    'long': room_data['longitude']
  };

  return coordinates;
}

// New function to track user's location.
const trackLocation = ({ onSuccess, onError = () => { } }) => {
  if ('geolocation' in navigator === false) {
    return onError(new Error('Geolocation is not supported by your browser.'));
  }

  // Use watchPosition instead.
  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    maximumAge: 1000
  });
};

// Initialize map with desired location pinpointed
function initMap() {
  // Get room coordinates
  const room_coordinates = getRoomCoordinates();
  const room_lat = parseFloat(room_coordinates['lat']);
  const room_long = parseFloat(room_coordinates['long']);

  // Init map with room location
  const room_loc = { lat: room_lat, lng: room_long };
  // The map, centered at given location
  const map = new google.maps.Map(document.getElementById("map"), {
    center: room_loc,
    mapId: '1d764dc13899b61e'
  });
  console.log(map.center);

  // The room marker, positioned at GG Brown
  const room_marker = new google.maps.Marker({
    position: room_loc,
    map: map,
    title: 'target room'
  });

  // The user marker, positioned at GG Brown
  const user_marker = new google.maps.Marker({
    position: room_loc,
    map: map,
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      fillColor: "#be983f",
      fillOpacity: .70,
      strokeColor: "#12455E",
      strokeOpacity: 1,
      strokeWeight: 2
    },
  });

  const fit_zoom = true;
  // Function to continuously update the user_marker
  trackLocation({
    onSuccess: ({ coords: { latitude: lat, longitude: lng } }) => {
      user_marker.setPosition({ lat, lng });
      if (fit_zoom) {
        const marker_bounds = new google.maps.LatLngBounds();
        console.log(room_marker.getPosition())
        marker_bounds.extend(room_marker.getPosition());
        marker_bounds.extend(user_marker.getPosition());

        // map.setOptions({ maxZoom: 20 });
        map.fitBounds(marker_bounds);
        // map.setOptions({ maxZoom: null });
        fit_zoom = false;
      }
    },
    onError: err =>
      alert(`Error: ${getPositionErrorMessage(err.code) || err.message}`)
  });

  // bounds for floor1
  const bounds_1 = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.29273958450291, -83.71516984441227),
    new google.maps.LatLng(42.293854432381664, -83.71278616217957)
  );

  // bounds for floor2
  const bounds_2 = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.29279758926315, -83.71516984441227),
    new google.maps.LatLng(42.29405892225341, -83.71278616217957)
  );

  // bounds for floor3
  const bounds_3 = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.292853987978575, -83.71516984441227),
    new google.maps.LatLng(42.294079346431595, -83.71278616217957)
  );

  // Array of all bounds 
  const bounds_arr = [bounds_1, bounds_2, bounds_3];


  /* IMAGE OVERLAY -- choose correct floor*/
  const floor_num = localStorage.getItem('room_num')[0]
  let image = `GGBL_F${floor_num}.png`;

  /**
   * The custom USGSOverlay object contains the USGS image,
   * the bounds of the image, and a reference to the map.
   */
  class USGSOverlay extends google.maps.OverlayView {
    bounds;
    image;
    div;
    constructor(bounds_arr, image) {
      super();
      this.bounds = bounds_arr[floor_num-1];
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
  const overlay = new USGSOverlay(bounds_arr, image);

  overlay.setMap(map);

  const toggleButton = document.createElement("button");


  toggleButton.textContent = "Search";
  toggleButton.classList.add("custom-map-control-button");


  // onClick return back to search screen (index.html)
  toggleButton.addEventListener("click", () => {
    window.location.replace('./index.html');

  });

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleButton);
}
