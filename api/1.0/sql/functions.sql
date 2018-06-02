DROP VIEW pesca.seascape CASCADE;
CREATE VIEW pesca.seascape AS 

SELECT DISTINCT ON (esn) 
		client_id,
		esn, vessel_id, vessel_name, 
		messagetype, 
		messagedetail,  
		to_timestamp(tstamp) AS tstamp,
lat, lon
-- 		ST_X(ST_Transform(ST_SetSRID(ST_MakePoint(lon, lat),4326),3857)) AS lon,
-- 		ST_Y(ST_Transform(ST_SetSRID(ST_MakePoint(lon, lat),4326),3857)) AS lat
	FROM positions 
	JOIN vessels USING(esn)
	JOIN clients USING(client_id)
	WHERE (lat BETWEEN -90 AND 90) AND (lon BETWEEN -180 AND 180) -- AND vessel_id > 0
	ORDER BY esn, tstamp DESC;

DROP VIEW IF EXISTS pesca.paths CASCADE;
CREATE VIEW pesca.paths AS 
SELECT  voyage_id, 
-- 		vessel_id, esn, 
-- 		atd, ata, 
		to_timestamp(tstamp) AS tstamp, lat, lon 
FROM voyages
JOIN vessels USING(vessel_id)
JOIN positions USING(esn)
WHERE to_timestamp(tstamp) BETWEEN COALESCE(atd,NOW()) AND COALESCE(ata,NOW())
ORDER BY voyage_id DESC, tstamp ASC;




CREATE OR REPLACE FUNCTION "pesca"."geometry_upsert"() RETURNS "trigger" 
	AS $BODY$
BEGIN
	NEW.geom = ST_SetSRID(ST_GeomFromGeoJSON(NEW.geom_geojson), 3857);
	NEW.entities = ST_NumGeometries(NEW.geom);
	NEW.dimensions = ST_NDims(NEW.geom);
	NEW.geometry_type = GeometryType(NEW.geom);
    RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;
ALTER FUNCTION "pesca"."geometry_upsert"() OWNER TO "inkas";


CREATE TRIGGER "geometry_upsert" BEFORE INSERT OR UPDATE ON "pesca"."geometries" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."geometry_upsert"();



CREATE OR REPLACE FUNCTION "pesca"."PosWhen"(IN v_id int4, IN t timestamptz, OUT _lon float8, OUT _lat float8) 
RETURNS RECORD
	AS $BODY$
DECLARE 
	t0   timestamptz;
	t1   timestamptz;
	f    float8;
	lat0 float8;
	lat1 float8;
	lon0 float8;
	lon1 float8;
	
BEGIN 

	SELECT INTO t0, lat0, lon0  
		to_timestamp(tstamp), lat, lon 
	FROM positions 
	JOIN vessels USING(esn)
	WHERE vessel_id=v_id 
	AND to_timestamp(tstamp) < t
	ORDER BY tstamp DESC 
	LIMIT 1;

	SELECT INTO t1, lat1, lon1  
		to_timestamp(tstamp), lat, lon 
	FROM positions 
	JOIN vessels USING(esn)
	WHERE vessel_id=v_id 
	AND to_timestamp(tstamp) > t
	ORDER BY tstamp ASC 
	LIMIT 1;

	SELECT INTO f EXTRACT (EPOCH FROM (t-t0)) / EXTRACT(EPOCH FROM (t1-t0));

	_lat = lat0 + f * (lat1 - lat0); 
	_lon = lon0 + f * (lon1 - lon0); 


END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;








CREATE OR REPLACE FUNCTION "pesca"."setLanceDate"() RETURNS "trigger" 
	AS $BODY$
DECLARE 
	v_id	INTEGER;
BEGIN
	SELECT vessel_id INTO v_id FROM pesca.voyages WHERE voyage_id=NEW.voyage_id;
	SELECT * INTO NEW.lon, NEW.lat FROM "PosWhen"(v_id, NEW.lance_start);

	RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;



CREATE TRIGGER "setLanceDate" BEFORE INSERT OR UPDATE OF "lance_start" ON "pesca"."lances" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."setLanceDate"();











CREATE OR REPLACE FUNCTION "pesca"."checkATD"() RETURNS "trigger" 
	AS $BODY$
DECLARE 
	atd_max	TIMESTAMP WITH TIME ZONE;
BEGIN
	SELECT MAX(atd) INTO atd_max 
	FROM pesca.voyages 
	WHERE vessel_id=NEW.vessel_id;
	
	IF (NEW.atd > atd_max) THEN
		RETURN NEW;
	ELSE
		RETURN NULL;
	END IF;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;



CREATE TRIGGER "checkATD" BEFORE INSERT OR UPDATE OF "atd" ON "pesca"."voyages" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."checkATD"();
