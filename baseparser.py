
#!/usr/bin/python

import sys
from html.parser import HTMLParser

class ZMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        print("Encountered a start tag:", tag)

    def handle_endtag(self, tag):
        print("Encountered an end tag :", tag)

    def handle_data(self, data):
        print("Encountered some data  :", data)

fin = open("./" + sys.argv[1])

data = fin.read()
fin.close()

parser = ZMLParser()
parser.feed(data)
