# data got from www.hill-bagging.co.uk
# UK fells have classifications (as shown below) included

import re
import csv
from Database import Database

# I only downloaded these classifications, more were available
classifications = {
    'Ma': 'Marilyn',
    'Hu': 'Hump',
    'Sim': 'Simm',
    'M': 'Munro',
    'C': 'Corbett',
    'D': 'Donald',
    'N': 'Nuttall',
    'W': 'Wainwright',
    'WO': 'Wainwright Outlying Fell',
    'B': 'Birkett',
    'E': 'Ethel',
    'CoH': 'Historic County Top (pre-1974)',
    'P500': 'P500 Peaks',
    'P600': 'P600 Peaks'
}

with Database() as db:
    fellID = db.GetLastFellID()

with open('UKHills.csv', newline='\n') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        latitude = row[' latitude']
        longitude = row[' longitude']

        try:
            elevation = float(row[' metres'])
        except Exception as e:
            print('Error converting elevation: ' + e)
            elevation = None

        name = row[' hillname']

        with Database() as db:
            if db.FellAlreadyInDB(name, elevation, latitude, longitude):
                continue

        countryCode = row[' country']
        country = "GB"
        if countryCode == "I":
            country = "Ireland"

        with Database() as db:
            fellID += 1
            db.AddFellToDB(fellID, name, elevation, latitude, longitude, country)
            print(f'Added {name} to database')

        for key, name in classifications.items():
            if row[key] == '1':
                with Database() as db:
                    classificationID = db.GetClassificationIDFromName(name)
                    db.AddNewFellClassification(fellID, classificationID)