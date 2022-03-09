// Listen for submit, get room_num and store in localStorage
document.getElementById('signup').addEventListener('submit', () => {
    const room_num = document.getElementById("mySearch").value;
    localStorage.setItem("room_num", room_num);
});


// Find coordinates in roominfo.csv
function readCSV(room_num, getCoor) {
  // Get and read csv file
  var GetFileBlobUsingURL = function (url, convertBlob) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function() {
        convertBlob(xhr.response);
    });
    xhr.send();
  };

  var blobToFile = function (blob, name) {
      blob.lastModifiedDate = new Date();
      blob.name = name;
      return blob;
  };

  var GetFileObjectFromURL = function(filePathOrUrl, convertBlob) {
    GetFileBlobUsingURL(filePathOrUrl, function (blob) {
        convertBlob(blobToFile(blob, 'roominfo.csv'));
    });
  };

  var FileURL="roominfo.csv"
  GetFileObjectFromURL(FileURL, function (fileObject) {
    console.log(fileObject);
    // Read the fileObject
    reader.readAsText(fileObject);
  });

  // Set up csv file reader
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const data = csvToArray(text);
    console.log(JSON.stringify(data)); // print all roominfo.csv data

    // getCoor (callback)
    const found = getCoor(room_num, data);

    // Set lat and long in localstorage
    localStorage.setItem("lat", found.latitude);
    localStorage.setItem("long", found.longitude);

  };
}


// Convert csv file to array
function csvToArray(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}


// Get coordinates from room_num in data
function getCoor(room_num, data) {
  const found_room = data.find(o => o.room_number === String(room_num));
  return found_room;
}


// Initialize map with desired location pinpointed
function initMap() {
  // Get room_num from localstorage
  const room_num = localStorage.getItem('room_num');

  // Get coordinates of room 
  readCSV(parseInt(room_num), getCoor);
  const found_lat = localStorage.getItem('lat');
  const found_long = localStorage.getItem('long');

  // Init map with location 
  const latitude = parseFloat(found_lat);
  const longitude = parseFloat(found_long);

  const new_loc = { lat: latitude, lng: longitude };
  // The map, centered at given location
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 20,
    center: new_loc,
  });
  // The marker, positioned at GG Brown
  const marker = new google.maps.Marker({
    position: new_loc,
    map: map,
  });
}


/// -----------TODO---------------------------------------------------------------------------

// Do a new search from the map page

// Update map to put marker at new location 

// function updateMap(lat, lng) {
//   // The location of GG Brown
//   const gg_brown = { lat: 42.29333057762535, lng: -83.71384208374704 };
//   // The map, centered at GG Brown
//   const map = new google.maps.Map(document.getElementById("map"), {
//     zoom: 20,
//     center: gg_brown,
//   });
//   // The marker, positioned at GG Brown
//   const marker = new google.maps.Marker({
//     position: gg_brown,
//     map: map,
//   });  
// }
