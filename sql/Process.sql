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
	sum(ConfirmedDailyIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 6 PRECEDING)/7 - 
	sum(ConfirmedPreviousIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 6 PRECEDING)/7 ConfirmedSDSMA4,
	sum(DeathsDailyIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 6 PRECEDING)/7 - 
	sum(DeathsPreviousIncrease) OVER(PARTITION BY Country_Region ORDER BY Last_Update ROWS 6 PRECEDING)/7 DeathsSDSMA4
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
	sum(ConfirmedDailyIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 6 PRECEDING)/7 - 
	sum(ConfirmedPreviousIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 6 PRECEDING)/7 ConfirmedSDSMA4,
	sum(DeathsDailyIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 6 PRECEDING)/7 - 
	sum(DeathsPreviousIncrease) OVER(PARTITION BY Country_Region, Province_State ORDER BY Last_Update ROWS 6 PRECEDING)/7 DeathsSDSMA4
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
	
	
-- Summarize by country, Week
DROP VIEW IF EXISTS SumByCountryWeek;
CREATE VIEW SumByCountryWeek AS
SELECT 	
	o.Country_Region 
	,min(o.Last_Update) Last_Update 
	,max(o.Confirmed) Confirmed
	,max(o.Deaths) Deaths
FROM 
	"output" o
WHERE
	strftime('%W', o.Last_Update) < (SELECT max(strftime('%W', o.Last_Update)) Last_Update FROM "output" o)
GROUP BY
	o.Country_Region 
	,strftime('%Y', o.Last_Update)
	,strftime('%W', o.Last_Update) 
	
-- 	Summarize by country, date, with Analysis
DROP VIEW IF EXISTS SumByCountryWeekAnalysis;
CREATE VIEW SumByCountryWeekAnalysis AS
SELECT 
	*,
	ConfirmedDailyIncrease-ConfirmedPreviousIncrease ConfirmedSDSMA4,
	DeathsDailyIncrease-DeathsPreviousIncrease DeathsSDSMA4
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
					SumByCountryWeek
			) t
	) t		
	
	
-- Summarize by country, state, week
DROP VIEW IF EXISTS SumByCountryStateWeek;
CREATE VIEW SumByCountryStateWeek AS
SELECT 	
	o.Country_Region
	,CASE WHEN o.Province_State = '' THEN o.Country_Region ELSE o.Province_State END Province_State
	,min(o.Last_Update)Last_Update 
	,sum(o.Confirmed) Confirmed
	,sum(o.Deaths) Deaths
FROM 
	"output" o
WHERE
	strftime('%W', o.Last_Update) < (SELECT max(strftime('%W', o.Last_Update)) Last_Update FROM "output" o)
GROUP BY
	o.Country_Region 	
	,CASE WHEN o.Province_State = '' THEN o.Country_Region ELSE o.Province_State END 
	,strftime('%Y', o.Last_Update)
	,strftime('%W', o.Last_Update) 
	
-- 	Summarize by country, state, week with Analysis
DROP VIEW IF EXISTS SumByCountryStateWeekAnalysis;
CREATE VIEW SumByCountryStateWeekAnalysis AS
SELECT 
	*,
	ConfirmedDailyIncrease - ConfirmedPreviousIncrease7 ConfirmedSDSMA4,
	DeathsDailyIncrease - DeathsPreviousIncrease DeathsSDSMA4
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
					SumByCountryStateWeek
			) t
	) t	
	
