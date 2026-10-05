import sqlite3
import math
from collections import defaultdict

RADIUS_EARTH = 6378000

class Database:
    
    def __init__(self, file='Fells.db'):
        self.con = sqlite3.connect(file)
        self.cur = self.con.cursor()

    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is None:
            self.con.commit()  # Commits all batch writes at the end in one single disk operation
        self.con.close()
    
    def AddFellToDB(self, fellID, name, elevation, latitude, longitude, country):
        self.cur.execute("""INSERT INTO fells 
                            (id, name, elevation, latitude, longitude, country) 
                            VALUES (?, ?, ?, ?, ?, ?)""",
                            (fellID, name, elevation, latitude, longitude, country))

    def FellAlreadyInDB(self, name, elevation, latitude, longitude):
        fells = self.cur.execute("""SELECT * 
                                    FROM fells 
                                    WHERE name = ? 
                                    AND elevation = ? 
                                    AND latitude = ? 
                                    AND longitude = ?""",
                                    (name, elevation, latitude, longitude)).fetchone()
        
        if fells == None:
            return False
        return True
    
    def IsAnotherFellCloseTo(self, latitude, longitude, distance=20):

        latitude = float(latitude)
        longitude = float(longitude)

        distance_radius = distance/RADIUS_EARTH

        d_latitude = distance_radius * (180 / math.pi)
        min_latitude  = latitude - d_latitude
        max_latitude = latitude + d_latitude

        # finding the minimum and maximum longitudes that each point could have a fell in
        d_longitude = distance_radius * (180 / math.pi) / math.cos(latitude * math.pi/180)
        min_longitude = longitude - d_longitude
        max_longitude = longitude + d_longitude
        fells = self.cur.execute("""SELECT id 
                                    FROM fells 
                                    WHERE (latitude BETWEEN ? AND ?) 
                                    AND (longitude BETWEEN ? AND ?)""", 
                                    (min_latitude, max_latitude, min_longitude, max_longitude)).fetchall()
        
        return len(fells) > 0
        
    def GetLastFellID(self):
        lastFellID = self.cur.execute("""SELECT id 
                                         FROM fells 
                                         ORDER BY id DESC""").fetchone()
        if lastFellID == None:
            return 0
        return lastFellID[0]
    
    def GetClassificationIDFromName(self, name):
        classification = self.cur.execute("""SELECT id 
                                              FROM classifications
                                              WHERE name = ?""",
                                              (name,)).fetchone()
        if classification is None:
            return None
        return classification[0]

    def AddNewFellClassification(self, fellID, classificationID):
        exists = self.cur.execute("""
            SELECT 1 FROM fell_classifications 
            WHERE fell_id = ? AND classification_id = ?
        """, (fellID, classificationID)).fetchone()

        if not exists:
            self.cur.execute("""
                INSERT INTO fell_classifications (fell_id, classification_id) 
                VALUES (?, ?)
            """, (fellID, classificationID))

    def GetOrCreateClassification(self, name, description=""):
        class_id = self.GetClassificationIDFromName(name)
        if class_id is not None:
            return class_id

        self.cur.execute(
            "INSERT INTO classifications (name, description) VALUES (?, ?)",
            (name, description)
        )
        return self.cur.lastrowid

    def GetFellIDByNameAndLocation(self, name, latitude, longitude):
        row = self.cur.execute("""
            SELECT id FROM fells 
            WHERE LOWER(name) = LOWER(?) 
              AND ABS(latitude - ?) < 0.0001 
              AND ABS(longitude - ?) < 0.0001
        """, (name, latitude, longitude)).fetchone()
        return row[0] if row else None

    def GetAllFellsByName(self):
        """Loads all fells into an in-memory dictionary grouped by lowercase name."""
        fells_by_name = defaultdict(list)
        rows = self.cur.execute("SELECT id, name, latitude, longitude FROM fells").fetchall()
        for fell_id, name, lat, lon in rows:
            if name and lat is not None and lon is not None:
                fells_by_name[name.strip().lower()].append((fell_id, float(lat), float(lon)))
        return fells_by_name

    def GetExistingFellClassifications(self):
        """Pre-loads all existing fell-classification links into a set."""
        rows = self.cur.execute("SELECT fell_id, classification_id FROM fell_classifications").fetchall()
        return set(rows)

    def AddFellClassificationsBatch(self, links):
        """Inserts a list of (fell_id, classification_id) tuples in a single batch query."""
        if not links:
            return
        self.cur.executemany("""
            INSERT INTO fell_classifications (fell_id, classification_id) 
            VALUES (?, ?)
        """, links)