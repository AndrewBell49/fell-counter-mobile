# data got from https://download.geofabrik.de
# download the .osm.pbf file

import osmium
import re
from Database import Database

def clean_elevation(ele, cleaned_log: list):
    if ele is None:
        return None
    try:
        ele_first = ele.split(";")[0]
        cleaned = re.sub(r'[^\d.]', '', ele_first.replace(',', '.'))
        if cleaned:
            float_cleaned = float(cleaned)
            
            # convert from ft to meters for specific case
            if "ft" in ele_first:
                float_cleaned *= 0.3048

            if cleaned != ele:
                cleaned_log.append({ 'original': ele, 'cleaned': float_cleaned })
            if float_cleaned <= 8850 and float_cleaned > 0:
                return float_cleaned
            
        cleaned_log.append({ 'original': ele, 'cleaned': None })
        return None
    except ValueError as e:
        cleaned_log.append({ 'original': ele, 'cleaned': f"Error: {e}" })
        return None

class PeakHandler(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.peaks = []
        self.nodes_processed = 0
        self.cleaned_log = []

    def node(self, n):
        self.nodes_processed += 1
        
        if self.nodes_processed % 10_000 == 0:
            print(f"Processed {self.nodes_processed:,} nodes, found {len(self.peaks):,} peaks so far...", end="\r")

        if n.tags.get('natural') == 'peak':
            self.peaks.append({
                'name': n.tags.get('name'),
                'ele': clean_elevation(n.tags.get('ele'), self.cleaned_log),
                'lat': float(n.location.lat),
                'lon': float(n.location.lon),
            })

file_mappings = [
    {"file": "osm_data/austria.osm.pbf", "country": "Austria"},
    {"file": "osm_data/canada.osm.pbf", "country": "Canada"},
    {"file": "osm_data/czech-republic.osm.pbf", "country": "Czechia"},
    {"file": "osm_data/denmark.osm.pbf", "country": "Denmark"},
    {"file": "osm_data/germany.osm.pbf", "country": "Germany"},
    {"file": "osm_data/guernsey-jersey.osm.pbf", "country": "UK & Ireland"},
    {"file": "osm_data/ireland.osm.pbf", "country": "UK & Ireland"},
    {"file": "osm_data/isle-of-man.osm.pbf", "country": "UK & Ireland"},
    {"file": "osm_data/italy.osm.pbf", "country": "Italy"},
    {"file": "osm_data/liechtenstein.osm.pbf", "country": "Liechtenstein"},
    {"file": "osm_data/luxembourg.osm.pbf", "country": "Luxembourg"},
    {"file": "osm_data/norway.osm.pbf", "country": "Norway"},
    {"file": "osm_data/poland.osm.pbf", "country": "Poland"},
    {"file": "osm_data/slovakia.osm.pbf", "country": "Slovakia"},
    {"file": "osm_data/slovenia.osm.pbf", "country": "Slovenia"},
    {"file": "osm_data/spain.osm.pbf", "country": "Spain"},
    {"file": "osm_data/switzerland.osm.pbf", "country": "Switzerland"},
    {"file": "osm_data/united-kingdom.osm.pbf", "country": "UK & Ireland"},
]


def main():
    cleaned_log = []
    for mapping in file_mappings:
        print(f"Parsing OSM file: {mapping['file']}...")
        handler = PeakHandler()
        handler.apply_file(mapping['file'])
        print(f"\nFound {len(handler.peaks)} peaks")

        cleaned_log.extend(handler.cleaned_log)

        with Database() as db:
            fellID = db.GetLastFellID() + 1
            added = 0

            for peak in handler.peaks:
                if (
                    (peak['lat'] is None) or 
                    (peak['lon'] is None) or 
                    (peak['name'] is None or peak['name'] == "") or
                    (peak['ele'] is None or peak['ele'] <= 0)
                ):
                    continue

                if not db.FellAlreadyInDB(peak['name'], peak['ele'], peak['lat'], peak['lon']) \
                and not db.IsAnotherFellCloseTo(peak['lat'], peak['lon']):
                    db.AddFellToDB(fellID, peak['name'], peak['ele'], peak['lat'], peak['lon'], mapping['country'])
                    fellID += 1
                    added += 1

            print(f"Added {added} new peaks")

    return cleaned_log

all_cleaned = main()

print("***************************************************")
print("Cleaned files:")
for cleaned in all_cleaned:
    print(cleaned)
