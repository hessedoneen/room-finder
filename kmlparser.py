
#!/usr/bin/python
# Nina, Amber, Alex, Kyle
# Run via: python3 kmlparser.py kml-file-name mode > kml-file-name.csv
import sys
from html.parser import HTMLParser

class ZMLParser(HTMLParser):
    def __init__(self, mode):
        super().__init__()
        self._placemark_found = False
        self._name_found = False
        self._coordinates_found = False
        self.mode = mode
        self.name = None
        if self.mode == 'rooms':
            print("room_name,room_number,lat,lng")
        else:
            print("floor,lat,lng")

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
                self.name = data
                self._name_found = False
            elif self._coordinates_found:
                coordinates = data.strip().replace('0 ', '').split(',')
                for i in range (0, len(coordinates) - 1, 2):
                    print(f'{self.name},{self.name},{coordinates[i + 1]},{coordinates[i]}')
                self._coordinates_found = False
                self._placemark_found = False

filename = sys.argv[1]
mode = sys.argv[2]

fin = open('./' + filename)

data = fin.read()
fin.close()

# use <rooms> for arg2 if you want to read rooms
# any other keyword will read hallways
parser = ZMLParser(mode)
parser.feed(data)
