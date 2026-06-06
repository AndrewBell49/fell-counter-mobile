import sqlite3
import math

RADIUS_EARTH = 6378000

class Database:
    
    def __init__(self, file='Fells.db'):
        self.con = sqlite3.connect(file)
        self.cur = self.con.cursor()

    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_value, traceback):
        self.con.close() # so the connection is only open while one instance is open
    
    def AddFellToDB(self, fellID, name, elevation, latitude, longitude, country):
        self.cur.execute("""INSERT INTO fells 
                            (id, name, elevation, latitude, longitude, country) 
                            VALUES (?, ?, ?, ?, ?, ?)""",
                            (fellID, name, elevation, latitude, longitude, country))
        self.con.commit()

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