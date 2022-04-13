
#!/usr/bin/python
# Nina, Amber, Alex, Kyle
# Run via: python3 kmlparser.py mode kml-file-name > kml-file-name.csv
import sys
from geopy import distance

class Coordinate():
    def __init__(self, latitude, longitude):
        self.lat = latitude
        self.lng = longitude

class GenerateCoords():
    def __init__(self, max_feet):
        # how many feet until we add a new coord?
        self.max_feet = max_feet

    # loads in coordinates as tuple pairs
    def load_data(self, data):
        coordinates = data.strip().replace('0 ', '').split(',')
        for i in range (0, len(coordinates) - 1, 2):
            print(f'{self.name},{coordinates[i + 1]},{coordinates[i]}')
        self._coordinates_found = False
        self._placemark_found = False

    # takes in two Coordinate object instances,
    # returns a list of all the coordinates generated from these two points
    # (does not include the two points)
    def gen_coords_between_two_points(self, pointA, pointB):
        # all coordinates between the two points up to precision
        return_coords = []

        num_coords = distance(pointA, pointB) / self.max_feet
        deltaX = (pointA.lat - pointB.lat) / num_coords
        deltaY = (pointA.lng - pointB.lng) / num_coords
        coord = [pointA.lat, pointA.lng]
        for i in range(0, num_coords):
            coord.lat += deltaX
            coord.lng += deltaY
            return_coords.append(coord.copy())

filename = sys.argv[1]
ft = sys.argv[2]

fin = open('./' + filename)

data = fin.read()
fin.close()
