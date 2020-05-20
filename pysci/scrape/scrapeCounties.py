
import requests
from bs4 import BeautifulSoup

dataFields = ['MTFCC', 'OID', 'GEOID', 'STATE', 'COUNTY', 'TRACT', 'BLKGRP', 'BLOCK', 'BASENAME', 'NAME', 'LSADC', 'FUNCSTAT', 'POP100', 'HU100','AREALAND', 'AREAWATER', 'UR', 'CENTLAT', 'CENTLON', 'INTPTLAT', 'INTPTLON']

def createTractDict(tractRow, stateName, countyName, fObject):
    row = {}
    row['STATENAME'] = stateName  + ', '
    row['COUNTYNAME'] = countyName[6:len(countyName)]  + ', '

    iter = 0

    while iter < len(tractRow):
        row[dataFields[iter]] = tractRow[iter].string.replace('\xa0','').strip() + ', '
        iter += 1

    fObject.write(row['STATENAME'])
    fObject.write(row['COUNTYNAME'])
    fObject.write(row['MTFCC'])
    fObject.write(row['OID'])
    fObject.write(row['GEOID'])
    fObject.write(row['STATE'])
    fObject.write(row['COUNTY'])
    fObject.write(row['TRACT'])
    fObject.write(row['BLKGRP'])
    fObject.write(row['BLOCK'])
    fObject.write(row['BASENAME'])
    fObject.write(row['NAME'])
    fObject.write(row['LSADC'])
    fObject.write(row['FUNCSTAT'])
    fObject.write(row['POP100'])
    fObject.write(row['HU100'])
    fObject.write(row['AREALAND'])
    fObject.write(row['AREAWATER'])
    fObject.write(row['UR'])
    fObject.write(row['CENTLAT'])
    fObject.write(row['CENTLON'])
    fObject.write(row['INTPTLAT'])
    fObject.write(row['INTPTLON'].replace(', ',''))
    fObject.write('\n')
        
        


outputList = []

baseURL = 'https://tigerweb.geo.census.gov/tigerwebmain/'
stateURL = 'TIGERweb_tabblock_census2010.html'
page = requests.get(baseURL + stateURL)

soup = BeautifulSoup(page.content, 'html.parser')

stateTable = soup.find("table")

stateRows = stateTable.find_all("td")

# Send OutputList to csv
with open("scrapedCensus.csv", 'w') as fObject:
    fObject.write("STATENAME, COUNTYNAME, MTFCC, OID, GEOID, STATE, COUNTY, TRACT, BLKGRP, BLOCK, BASENAME, NAME, LSADC, FUNCSTAT, POP100, HU100, AREALAND, AREAWATER, UR, CENTLAT, CENTLON, INTPTLAT, INTPTLON\n")
    fObject.close

with open("scrapedCensus.csv", 'a') as fObject:
    # Parse for each state
    for stateRow in stateRows:
        statePage = requests.get(baseURL + stateRow.a["href"])
        stateSoup = BeautifulSoup(statePage.content, 'html.parser')
        countyTable = stateSoup.find("table")
        countyRows = countyTable.find_all("td")

        for countyRow in countyRows:
            print(countyRow.a.string + ", " + stateRow.a.string)
            countyPage = requests.get(baseURL + countyRow.a["href"])
            countySoup = BeautifulSoup(countyPage.content, 'html.parser')
            censusTracts = countySoup.find("table")
            
            censusRows = censusTracts.find_all("tr")

            # Remove the first row. It's headers
            del censusRows[0]

            for censusRow in censusRows:
                censusFields = censusRow.find_all("td")

                createTractDict(censusFields,stateRow.a.string,countyRow.a.string, fObject)

fObject.close
