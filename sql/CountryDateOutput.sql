SELECT 
    *
FROM
    SumByCountryDateAnalysis
WHERE
    Country_Region in ('US', 'Italy', 'Spain', 'UK', 'France')


/* 
    Commands

sqlite3.exe ../vscode/output.db
sqlite> .headers on
sqlite> .mode csv
sqlite> .output SumByCountryDateAnalysis.csv
sqlite> SELECT * FROM SumByCountryDateAnalysis WHERE Country_Region in ('US', 'Italy', 'Spain', 'UK', 'France');
sqlite> .output stdout
*/