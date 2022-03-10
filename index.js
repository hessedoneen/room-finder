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
            convertBlob(blobToFile(blob, 'roominfo.csv'));
        });
    };

    var FileURL = "roominfo.csv"
    GetFileObjectFromURL(FileURL, function (fileObject) {
        console.log(fileObject);
        // Read the fileObject
        reader.readAsText(fileObject);
    });

    // Set up csv file reader
    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        console.log(csvText);

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

    const stringguy = JSON.stringify(csvObject);
    const backtoobject = JSON.parse(stringguy);

    return JSON.stringify(csvObject);
}
