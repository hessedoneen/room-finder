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
    'latitude': room_data['latitude'],
    'longitude': room_data['longitude']
  };

  return coordinates;
}

function filterRoomDataByKeyword(keyword) {
  // Get all room data
  const room_data_all = JSON.parse(localStorage.getItem('rooms_data'));

  // Map this room data to only those which are toilets
  const data = [];
  for (let room in room_data_all) {
    if (room.includes(keyword)) {
      const room_data = room_data_all[room];
      room_data['room_number'] = room;
      data.push(room_data);
    }
  }

  return data;
}

function getRestroomCoordinates() {
  // Map this room data to only those which are toilets
  return filterRoomDataByKeyword('T');
}

function getElevatorCoordinates() {
  // Map this room data to only those which are elevators
  return filterRoomDataByKeyword('E');
}

function getStairwayCoordinates() {
  // Map this room data to only those which are elevators
  return filterRoomDataByKeyword('S');
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
  const room_lat = parseFloat(room_coordinates['latitude']);
  const room_long = parseFloat(room_coordinates['longitude']);
  // room loc is center and starting point
  const room_loc = { lat: room_lat, lng: room_long };

  function createMarker(pos, title, icon=null) {
    console.log("position", pos);
    console.log("title", title);
    var marker = new google.maps.Marker({
      position: pos,
      map: map,
      title: title
    })
    if (icon !== null) {
      marker.setIcon(icon)
    }
    google.maps.event.addListener(marker, 'click', function() {
      map.setZoom(21);
      map.setCenter(marker.getPosition());
    })
    return marker;
  }

  // The map, centered at given location
  const map = new google.maps.Map(document.getElementById("map"), {
    center: room_loc,
    mapId: '1d764dc13899b61e'
  });

  console.log('room_loc', room_loc);
  // The room marker, positioned at GG Brown
  const room_marker = createMarker(room_loc, 'target room');

  // The user marker, positioned at GG Brown
  const user_marker = createMarker(room_loc, 'user location', {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 5,
    fillColor: "#be983f",
    fillOpacity: .70,
    strokeColor: "#12455E",
    strokeOpacity: 1,
    strokeWeight: 2
  });

  // takes in an array of lat,lng,room_number objects, and an icon
  // maps all these objects on the map under the icon
  function mark_all_rooms(room_info, icon) {
    markers = [];
    for (let i = 0; i < room_info.length; i++){
      console.log("room info", room_info[i]);
      let room_coor = {
        lat: parseFloat(room_info[i]['latitude']),
        lng: parseFloat(room_info[i]['longitude'])
      }
      new_marker = createMarker(room_coor,room_info[i]['room_number'],icon);
      new_marker.setVisible(false);
      markers.push(new_marker);
    }
    return markers;
  }

  function mark_elevators(floor_num) {
    icon = "./elevator_icon.png"
    return mark_all_rooms(getElevatorCoordinates().filter(room => room['room_number'][0] === floor_num), icon)
  }

  function mark_stairways(floor_num) {
    icon = "./stairway_icon.png"
    return mark_all_rooms(getStairwayCoordinates().filter(room => room['room_number'][0] === floor_num), icon)
  }

  function mark_restrooms(floor_num) {
    icon = "./restroom_icon.png"
    return mark_all_rooms(getRestroomCoordinates().filter(room => room['room_number'][0] === floor_num), icon)
  }

  /* IMAGE OVERLAY -- choose correct floor*/
  const floor_num = localStorage.getItem('room_num')[0]
  let image = `GGBL_F${floor_num}.png`;

  // filled with google maps markers
  const restrooms = mark_restrooms(floor_num); // arr with all markers of restrooms
  const elevators = mark_elevators(floor_num);
  const stairways = mark_stairways(floor_num);

  // bounds for floor1
  const bounds_f1 = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.29273958450291, -83.71516984441227),
    new google.maps.LatLng(42.293854432381664, -83.71278616217957)
  );

  // bounds for floor2
  const bounds_f2 = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.29279758926315, -83.71516984441227),
    new google.maps.LatLng(42.29405892225341, -83.71278616217957)
  );

  // bounds for floor3
  const bounds_f3 = new google.maps.LatLngBounds(
    new google.maps.LatLng(42.292853987978575, -83.71516984441227),
    new google.maps.LatLng(42.294079346431595, -83.71278616217957)
  );

  // Array of all bounds 
  const bounds_arr = [bounds_f1, bounds_f2, bounds_f3];
  const map_bounds =  bounds_arr[floor_num-1];

  // Function to continuously update the user_marker
  let fit_zoom = true;
  trackLocation({
    onSuccess: ({ coords: { latitude: lat, longitude: lng } }) => { //heading:hdng
      user_marker.setPosition({ lat, lng });

      // //Set icon to face the correct direction
      // console.log("lat,lng: ", lat, lng)
      // console.log("heading: ", hdng); // hdng is null -- device problem?
      // const head_icon = {
      //   path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      //   scale: 5,
      //   fillColor: "#be983f",
      //   fillOpacity: .70,
      //   strokeColor: "#12455E",
      //   strokeOpacity: 1,
      //   strokeWeight: 2,
      //   rotation: hdng
      // }
      // user_marker.setIcon(head_icon);

      if (fit_zoom) {
        const marker_bounds = new google.maps.LatLngBounds();
        marker_bounds.extend(room_marker.getPosition());
        marker_bounds.extend(user_marker.getPosition());

        map.fitBounds(marker_bounds);
        fit_zoom = false;
      }
    },
    onError: () => {
      alert(`Location must be enabled for navigation experience`);
      user_marker.setVisible(false);
      map.fitBounds(map_bounds);
    }
  });

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
      this.bounds = map_bounds;
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

  // sets the map on all markers in the array to be visible or not
  function setMapOnAll(rooms_arr, visibility) {
    for (let i = 0; i < rooms_arr.length; i++) {
      rooms_arr[i].setVisible(visibility);

    }
  } 

  // marking restrooms
  const restroomButton = document.createElement("button");
  let restroomToggle = false;

  restroomButton.textContent = "Restrooms";
  restroomButton.classList.add("custom-map-control-button");

  // onClick to show or unshow restrooms
  restroomButton.addEventListener("click", () => {
    if (!restroomToggle) {
      // Set all restroom markers visible
      setMapOnAll(restrooms, true);
      restroomToggle = true;
    } else {
      // Remove all restroom markers (but keep in array)
      setMapOnAll(restrooms, false);
      restroomToggle = false;
    }
  });

  // marking elevators
  const elevatorButton = document.createElement("button");
  let elevatorToggle = false;

  elevatorButton.textContent = "Elevators";
  elevatorButton.classList.add("custom-map-control-button");

  // onClick to show or unshow elevators
  elevatorButton.addEventListener("click", () => {
    console.log(elevatorToggle);
    if (!elevatorToggle) {
      // Set all elevator markers visible
      setMapOnAll(elevators, true);
      elevatorToggle = true;
    } else {
      // Remove all elevator markers (but keep in array)
      setMapOnAll(elevators, false);
      elevatorToggle = false;
    }
  });

  // marking stairways
  const stairwayButton = document.createElement("button");
  let stairwayToggle = false;

  stairwayButton.textContent = "Stairways";
  stairwayButton.classList.add("custom-map-control-button");

  // onClick to show or unshow stairways
  stairwayButton.addEventListener("click", () => {
    console.log(restroomToggle);
    if (!stairwayToggle) {
      // Set all restroom markers visible
      setMapOnAll(stairways, true);
      stairwayToggle = true;
    } else {
      // Remove all restroom markers (but keep in array)
      setMapOnAll(stairways, false);
      stairwayToggle = false;
    }
  });


  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleButton);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(restroomButton);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(elevatorButton);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(stairwayButton);
}
