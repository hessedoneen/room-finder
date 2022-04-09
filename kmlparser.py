
#!/usr/bin/python
# Nina, Amber, Alex, Kyle
# Run via: python3 kmlparser.py kml-file-name > kml-file-name.csv
import sys
from html.parser import HTMLParser

class ZMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self._placemark_found = False
        self._name_found = False
        self._coordinates_found = False
        print("room_name,room_number,latitude,longitude")

    def handle_starttag(self, tag, attrs):
        if tag == 'placemark':
            self._placemark_found = True
        elif self._placemark_found and tag == 'name':
            self._name_found = True
        elif self._placemark_found and tag == 'coordinates':
            self._coordinates_found = True

    def handle_data(self, data):
        if self._placemark_found:
            if self._name_found:
                print(data + ',', end='')
                self._name_found = False
            elif self._coordinates_found:
                coordinates = data.split(',')
                print(coordinates[1] + ',' + coordinates[0])
                self._coordinates_found = False
                self._placemark_found = False

fin = open('./' + sys.argv[1])

data = fin.read()
fin.close()

parser = ZMLParser()
parser.feed(data)
