const csvFilePath= 'C:/Users/clark/OneDrive/Documents/GitHub/COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/01-25-2020.csv'
const csvFileFolder='C:/Users/clark/OneDrive/Documents/GitHub/COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/'
const csv=require('csvtojson')

const fs = require('fs');

const csvWriter  = require('csv-write-stream')
var writer = csvWriter({headers: ['FIPS','Admin2','Province_State','Country_Region','Last_Update','Lat','Long_','Confirmed','Deaths','Recovered','Active','Combined_Key']})
writer.pipe(fs.createWriteStream('C:/Users/clark/OneDrive/Documents/GitHub/COVID-19/vscode/output.csv'))

var CountryConversions = {
    "Mainland China" : "China"
}

fs.readdir(csvFileFolder,function (err, files){
    files.forEach(function (csvFilePath) {
        if (csvFilePath.split('.').pop() == "csv") {

            csv()
            .fromFile(csvFileFolder + csvFilePath)
            .then((jsonObj)=>{
                //console.log(jsonObj);
                /**
                 * [
                 * 	{a:"1", b:"2", c:"3"},
                 * 	{a:"4", b:"5". c:"6"}
                 * ]
                 */ 
                jsonObj.forEach( function(row){
                    //console.log("test")
                    //row['Province_State'] = row['Province/State'];
                    //delete row['Province/State'];
                    if ('Country/Region' in row) {
                        row['Country_Region'] = row['Country/Region'];
                        delete row['Country/Region'];
                    };

                    if (row['Country_Region'] in CountryConversions) {
                        row['Country_Region'] = CountryConversions[row['Country_Region']]
                    };
                
                    if ('Province/State' in row) {
                        //console.log("test")
                        i = row.Province_State
                        row['Province_State'] = row['Province/State'];
                        delete row['Province/State'];
                    };
                
                    if ('Last Update' in row) {
                        row['Last_Update'] = row['Last Update'];
                        delete row['Last Update'];
                    };

                    row['Last_Update'] = new Date(csvFilePath.split('.')[0]).toISOString().split('T')[0];
                
                    if ('Latitude' in row) {
                        row['Lat'] = row['Latitude'];
                        delete row['Latitude'];
                    };
                
                    if ('Longitude' in row) {
                        row['Long_'] = row['Longitude'];
                        delete row['Longitude'];
                    };
                
                    //console.log(row);
                    writer.write(row);
                });
            });
        };
    });
})
/*


const csv = require('csv-parser');
const fs = require('fs');

const replace = require('replace-in-file');
const options = {
  files: 'C:/Users/clark/OneDrive/Documents/GitHub/COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/01-25-2020.csv',
  from: 'Province/State',
  to: 'Province_State',
};

replace.sync(options);

const csvWriter  = require('csv-write-stream')
var writer = csvWriter({headers: ['FIPS','Admin2','Province_State','Country_Region','Last_Update','Lat','Long_','Confirmed','Deaths','Recovered','Active','Combined_Key']})
writer.pipe(fs.createWriteStream('output.csv'))

//Province/State,Country/Region,Last Update,Confirmed,Deaths,Recovered

fs.createReadStream('C:/Users/clark/OneDrive/Documents/GitHub/COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/01-25-2020.csv')
  .pipe(csv())
  .on('data', function(row) {
    //console.log(row);

    obj = Object.keys(row)
    vals = Object.values(row)
    //console.log(obj);
    //console.log(vals);

    /*console.log(JSON.stringify(row))
    for (var i in row) {
        if (i = "Province/State") {
            console.log(i);
            console.log(row[i]);
        }
    }

    if ('Country/Region' in row) {
        row['Country_Region'] = row['Country/Region'];
        delete row['Country/Region'];
    };

    if (!('Province_State' in row)) {
        //console.log("test")
        i = row.Province_State
        //row['Province_State'] = row['Province/State'];
        //delete row['Province/State'];
    };

    if ('Last Update' in row) {
        row['Last_Update'] = row['Last Update'];
        delete row['Last Update'];
    };

    if ('Latitude' in row) {
        row['Lat'] = row['Latitude'];
        delete row['Latitude'];
    };

    if ('Longitude' in row) {
        row['Long_'] = row['Longitude'];
        delete row['Longitude'];
    };

    //console.log(row);
    writer.write(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

*/