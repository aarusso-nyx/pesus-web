DROP VIEW IF EXISTS pesca.seascape CASCADE;
CREATE VIEW pesca.seascape AS 
WITH scape AS 
(SELECT p.esn, MAX(tstamp) AS tstamp, to_timestamp(MAX(tstamp)) AS lastseen, NOW() - to_timestamp(MAX(tstamp)) AS age
FROM pesca.positions p
GROUP BY esn),

docked AS (
SELECT scape.*, 
		dev.miss_after, dev.lost_after, 
		pos.lat, pos.lon, pos.sog, pos.head, pos.input1, pos.input2, pos.battery_fail,pos.external_power, pos.vibration, 
		cli.client_id, cli.client_name, ves.vessel_id, ves.vessel_name, ves.port_id,
		st_within(ST_SetSRID(ST_Point(lon,lat), 4326), geom_4326) AS dock
FROM devices dev  
LEFT JOIN scape USING(esn) 
LEFT JOIN pesca.vessels ves USING(esn)
LEFT JOIN pesca.clients cli USING(client_id)
LEFT JOIN pesca.positions pos USING(tstamp,esn)
LEFT JOIN pesca.geometries geo ON (ves.port_id = geo.geometry_id))

SELECT *, 
	NOT dock AND NOW() - lastseen BETWEEN miss_after AND lost_after AS miss,
	NOT dock AND NOW() - lastseen > lost_after AS lost,
	NOT dock AND NOW() - lastseen < miss_after AS sail
FROM docked;

-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
DROP VIEW IF EXISTS pesca.fleethealth;
CREATE VIEW pesca.fleethealth AS 
SELECT client_id,
COUNT(*) AS fleet,
COUNT(NULLIF(miss,FALSE)) AS miss,
COUNT(NULLIF(lost,FALSE)) AS lost, 
COUNT(NULLIF(dock,FALSE)) AS dock,
COUNT(NULLIF(sail,FALSE)) AS sail 
FROM pesca.seascape
GROUP BY client_id;

-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
DROP VIEW IF EXISTS pesca.localizations CASCADE;
CREATE VIEW pesca.localizations AS 
WITH pos AS (SELECT *,
st_within(ST_SetSRID(ST_Point(lon,lat), 4326), geom) AS inside
FROM pesca.seascape, pesca.geometries) 

SELECT esn, 
		geometry_id, geometry_name, 
		vessel_id, vessel_name, port_id
FROM pos WHERE inside;



-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
DROP VIEW IF EXISTS pesca.vessel_perms CASCADE;
CREATE VIEW pesca.vessel_perms AS  
WITH vft AS (
    SELECT v.vessel_id,
            ft_1.fishingtype_id,
            ft_1.fishingtype_desc
    FROM pesca.vessels v, pesca.fishingtypes ft_1)
    
SELECT  vft.vessel_id,
        vft.fishingtype_id,
        vft.fishingtype_desc,
        (ft.id IS NOT NULL) AS value
FROM vft
LEFT JOIN pesca.vessel_fishingtypes ft USING (vessel_id, fishingtype_id);


-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
DROP VIEW IF EXISTS pesca.vessel_checks CASCADE;
CREATE VIEW pesca.vessel_checks AS
WITH vct AS (
	SELECT v.vessel_id, c.* 
	FROM pesca.vessels v, pesca.checks c
	WHERE c.check_subject='vessel')

SELECT 	vct.vessel_id, 
		vct.check_id, 
		vct.check_desc, 
		vct.check_order, 
		(ct.id IS NOT NULL) AS value 
FROM vct 
LEFT JOIN vessel_checktypes ct USING(vessel_id,check_id);

-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
DROP VIEW IF EXISTS pesca.client_checks CASCADE;
CREATE VIEW pesca.client_checks AS
WITH vct AS (
	SELECT v.client_id, c.* 
	FROM clients v, checks c
	WHERE c.check_subject='client')

SELECT 	vct.client_id, 
		vct.check_id, 
		vct.check_desc, 
		vct.check_order, 
		(ct.id IS NOT NULL) AS value 
FROM vct 
LEFT JOIN client_checktypes ct USING(client_id,check_id);

