import os,glob
import sqlite3
import csv
import pandas as pd
import numpy as np
import datetime
import math

folder_path ='C:/Users/clark/source/repos/COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/'
output_path = 'C:/Users/clark/source/repos/COVID-19/vscode/output.csv'

conn = sqlite3.connect('./output.db')
c = conn.cursor()

c.execute('DROP TABLE IF EXISTS output;')
c.execute('CREATE TABLE IF NOT EXISTS output(FIPS INTEGER,Admin2 TEXT,Province_State TEXT,Country_Region TEXT,Last_Update REAL,Lat REAL,Long_ REAL,Confirmed INTEGER,Deaths INTEGER,Recovered INTEGER,Active INTEGER,Combined_Key TEXT, Incident_Rate REAL, Case_Fatality_Ratio REAL)')
conn.commit()
                              
first_flag = 1

def get_julian_datetime(date):

    # Ensure correct format
    if not isinstance(date, datetime.datetime):
        raise TypeError('Invalid type for parameter "date" - expecting datetime')
    elif date.year < 1801 or date.year > 2099:
        raise ValueError('Datetime must be between year 1801 and 2099')

    # Perform the calculation
    julian_datetime = 367 * date.year - int((7 * (date.year + int((date.month + 9) / 12.0))) / 4.0) + int(
        (275 * date.month) / 9.0) + date.day + 1721013.5 + (
                          date.hour + date.minute / 60.0 + date.second / math.pow(60,
                                                                                  2)) / 24.0 - 0.5 * math.copysign(
        1, 100 * date.year + date.month - 190002.5) + 0.5

    return julian_datetime

file_count = len(glob.glob(os.path.join(folder_path, "*.csv")))
counter = 0

for filename in glob.glob(os.path.join(folder_path, "*.csv")):
    #print(filename)

    file_tail = os.path.split(filename)[1].split('.')[0]
    file_date = datetime.datetime.strptime(file_tail, '%m-%d-%Y')
    #print(file_date)

    df = pd.read_csv(filename, header="infer", encoding = 'utf8', delimiter=',')
    df = df.rename(columns={"Province/State":"Province_State", "Country/Region":"Country_Region", "Last Update": "Last_Update", "Latitude":"Lat", "Longitude":"Long_"})
    
    df.loc[(df.Country_Region == 'Mainland China'), 'Country_Region']='China'
    df.loc[(df.Country_Region == 'UK'), 'Country_Region']='United Kingdom'

    df.Last_Update = file_date

    #print(df.columns.to_list())

    
    cols = {
        "FIPS": "INTEGER",
        "Admin2": "TEXT",
        "Province_State": "TEXT",
        "Country_Region": "TEXT",
        "Last_Update": "REAL",
        "Lat": "REAL",
        "Long_": "REAL",
        "Confirmed": "INTEGER",
        "Deaths": "INTEGER",
        "Recovered": "INTEGER",
        "Active": "INTEGER",
        "Combined_Key": "TEXT",
        "Incident_Rate": "REAL",
        "Case_Fatality_Ratio": "REAL" 
    }

    default_typ = {
        "INTEGER": 0,
        "TEXT": "",
        "REAL": 0.0
    }


    for key in cols.keys():
        if not(key in df.columns.to_list()):
            df[key] = default_typ[cols[key]]

    df = df.reindex(columns=["FIPS","Admin2","Province_State", "Country_Region", "Last_Update", "Lat", "Long_", "Confirmed", "Deaths", "Recovered", "Active", "Combined_Key", "Incident_Rate", "Case_Fatality_Ratio"])

    if first_flag == 1:
        df.to_csv(output_path, header=True) 
        first_flag = 0
    else:
        df.to_csv(output_path, mode='a', header=False)

    df.Last_Update = get_julian_datetime(file_date)
    #print(df)
    
    c.executemany('INSERT INTO output(FIPS,Admin2,Province_State,Country_Region,Last_Update,Lat,Long_,Confirmed,Deaths,Recovered,Active,Combined_Key,Incident_Rate,Case_Fatality_Ratio) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', df.values.tolist())

    conn.commit()

    counter += 1

    if counter % 20 == 0:
        print(round((counter / file_count)*100))

    #with open(filename, 'r') as f:
    #    reader = csv.DictReader(f)
    #    for row in reader:
    #        print(row["ï»¿Province/State"])


