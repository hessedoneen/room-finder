if (localStorage.getItem("rooms_data") === null) {
    readRoomsIntoLocalStorage();
}

// Find coordinates in roominfo.csv
function readRoomsIntoLocalStorage() {
    // Get and read csv file
    var GetFileBlobUsingURL = function (url, convertBlob) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function () {
            convertBlob(xhr.response);
        });
        xhr.send();
    };

    var blobToFile = function (blob, name) {
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    };

    var GetFileObjectFromURL = function (filePathOrUrl, convertBlob) {
        GetFileBlobUsingURL(filePathOrUrl, function (blob) {
            convertBlob(blobToFile(blob, 'GGBL.csv'));
        });
    };

    var FileURL = "GGBL.csv"
    GetFileObjectFromURL(FileURL, function (fileObject) {
        // Read the fileObject
        reader.readAsText(fileObject);
    });

    // Set up csv file reader
    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;

        // Set all room data in localstorage
        localStorage.setItem("rooms_data", csvToJSONString(csvText));
    };
}

function csvToJSONString(csvString) {
    const lines = csvString.split('\n');
    const headers = lines[0].split(',');
    const data = lines.splice(1);

    csvObject = {};
    for (let i = 0; i < data.length; i++) {
        attributes = {};
        const line = data[i].split(',');
        for (let j = 1; j < headers.length; ++j) {
            attributes[headers[j]] = line[j];
        }
        csvObject[line[0]] = attributes;
    }

    return JSON.stringify(csvObject);
}

// Dropdown/autocomplete menu
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

const room_data_all = JSON.parse(localStorage.getItem('rooms_data'));
let opts = [];
if (localStorage.getItem("rooms_data") !== null) {
    let temp = Object.keys(room_data_all);
    for (let i = 0; i < temp.length; i++){
      opts.push("GGBL " + temp[i]);
    }
}

/*initiate the autocomplete function on the "myInput" element, and pass 
along the opts array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"), opts);

/* Set the width of the sidebar to 250px (show it) */
function openNav() {
    document.getElementById("mySidepanel").style.width = "200px";
}
  
/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}