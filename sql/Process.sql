SELECT FIPS, Admin2, Province_State, Country_Region, Last_Update, Lat, Long_, Confirmed, Deaths, Recovered, Active, Combined_Key
FROM "output";

select count(*) from "output";

-- Summarize by country, date
DROP VIEW IF EXISTS SumByCountryDate;
CREATE VIEW SumByCountryDate AS
SELECT 	
	o.Country_Region 
	,o.Last_Update 
	,sum(o.Confirmed) Confirmed
	,sum(o.Deaths) Deaths
FROM 
	"output" o
GROUP BY
	o.Country_Region 
	,o.Last_Update
	
-- 	Summarize by country, date, with Analysis
DROP VIEW IF EXISTS SumByCountryDateAnalysis;
CREATE VIEW SumByCountryDateAnalysis AS
SELECT 
	*,
	sum(ConfirmedDailyIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 7 PRECEDING)/7 - 
	sum(ConfirmedPreviousIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 7 PRECEDING)/7 ConfirmedSDSMA4,
	sum(DeathsDailyIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 7 PRECEDING)/7 - 
	sum(DeathsPreviousIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 7 PRECEDING)/7 DeathsSDSMA4
FROM
	(
		SELECT 	
			*,
			lag(ConfirmedDailyIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update) as ConfirmedPreviousIncrease,
			lag(DeathsDailyIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update) as DeathsPreviousIncrease
		FROM 
			(
				SELECT 
					*,
					lag(Confirmed) OVER (PARTITION BY Country_Region ORDER BY Last_Update) ConfirmedPrevious,
					Confirmed - lag(Confirmed) OVER (PARTITION BY Country_Region ORDER BY Last_Update) as ConfirmedDailyIncrease,
					lag(Deaths) OVER (PARTITION BY Country_Region ORDER BY Last_Update) DeathsPrevious,
					Deaths - lag(Deaths) OVER (PARTITION BY Country_Region ORDER BY Last_Update) as DeathsDailyIncrease
				FROM 
					SumByCountryDate
			) t
	) t		
	
-- Summarize by country, state, date
DROP VIEW IF EXISTS SumByCountryStateDate;
CREATE VIEW SumByCountryStateDate AS
SELECT 	
	o.Country_Region
	,CASE WHEN o.Province_State = '' THEN o.Country_Region ELSE o.Province_State END Province_State
	,o.Last_Update 
	,sum(o.Confirmed) Confirmed
	,sum(o.Deaths) Deaths
FROM 
	"output" o
GROUP BY
	o.Country_Region 
	,o.Last_Update	
	,CASE WHEN o.Province_State = '' THEN o.Country_Region ELSE o.Province_State END 
	
-- 	Summarize by country, state, with Analysis
DROP VIEW IF EXISTS SumByCountryStateDateAnalysis;
CREATE VIEW SumByCountryStateDateAnalysis AS
SELECT 
	*,
	sum(ConfirmedDailyIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 7 PRECEDING)/7 - 
	sum(ConfirmedPreviousIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 7 PRECEDING)/7 ConfirmedSDSMA4,
	sum(DeathsDailyIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 7 PRECEDING)/7 - 
	sum(DeathsPreviousIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 7 PRECEDING)/7 DeathsSDSMA4
FROM
	(
		SELECT 	
			*,
			lag(ConfirmedDailyIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update) as ConfirmedPreviousIncrease,
			lag(DeathsDailyIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update) as DeathsPreviousIncrease
		FROM 
			(
				SELECT 
					*,
					lag(Confirmed) OVER (PARTITION BY Country_Region, Province_State ORDER BY Last_Update) ConfirmedPrevious,
					Confirmed - lag(Confirmed) OVER (PARTITION BY Country_Region, Province_State ORDER BY Last_Update) as ConfirmedDailyIncrease,
					lag(Deaths) OVER (PARTITION BY Country_Region, Province_State ORDER BY Last_Update) DeathsPrevious,
					Deaths - lag(Deaths) OVER (PARTITION BY Country_Region, Province_State ORDER BY Last_Update) as DeathsDailyIncrease
				FROM 
					SumByCountryStateDate
			) t
	) t	
