-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "pesca"."provision"() RETURNS "trigger" 
	AS $BODY$
BEGIN
	INSERT INTO pesca.devices (esn) VALUES (NEW.esn);
	INSERT INTO pesca.vessels (esn) VALUES (NEW.esn);
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS "provision" ON "pesca"."provisions_smart1";
CREATE TRIGGER "provision" BEFORE INSERT OR UPDATE ON "pesca"."provisions_smart1" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."provision"();


-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "pesca"."geometry_upsert"() RETURNS "trigger" 
	AS $BODY$
BEGIN
	NEW.geom_4326 = ST_SetSRID(ST_GeomFromGeoJSON(NEW.geom_geojson), 4326);
	NEW.entities = ST_NumGeometries(NEW.geom);
	NEW.dimensions = ST_NDims(NEW.geom);
	NEW.geometry_type = GeometryType(NEW.geom);
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS "geometry_upsert" ON "pesca"."geometries";
CREATE TRIGGER "geometry_upsert" BEFORE INSERT OR UPDATE OF "geom_geojson" ON "pesca"."geometries" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."geometry_upsert"();


-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-- Set Lance detail from current LanceDate
-- Helper Function
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
	FROM pesca.positions 
	JOIN pesca.vessels USING(esn)
	WHERE vessel_id=v_id 
	AND to_timestamp(tstamp) < t
	ORDER BY tstamp DESC 
	LIMIT 1;

	SELECT INTO t1, lat1, lon1  
		to_timestamp(tstamp), lat, lon 
	FROM pesca.positions 
	JOIN pesca.vessels USING(esn)
	WHERE vessel_id=v_id 
	AND to_timestamp(tstamp) > t
	ORDER BY tstamp ASC 
	LIMIT 1;

	SELECT INTO f EXTRACT (EPOCH FROM (t-t0)) / EXTRACT(EPOCH FROM (t1-t0));

	_lat = lat0 + f * (lat1 - lat0); 
	_lon = lon0 + f * (lon1 - lon0); 
END;
$BODY$
LANGUAGE plpgsql;


-------------------------------------------------------------------------
-- Set Lance detail from current LanceDate
-- Actual TRIGGER
CREATE OR REPLACE FUNCTION "pesca"."setLanceDate"() RETURNS "trigger" 
	AS $BODY$
DECLARE 
	v_id	INTEGER;
BEGIN
	SELECT vessel_id INTO v_id FROM pesca.voyages WHERE voyage_id=NEW.voyage_id;
	SELECT * INTO NEW.lon, NEW.lat FROM "pesca"."PosWhen"(v_id, NEW.lance_start);

	RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS "setLanceDate" ON "pesca"."lances";
CREATE TRIGGER "setLanceDate" BEFORE INSERT OR UPDATE OF "lance_start" ON "pesca"."lances" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."setLanceDate"();


-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
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
LANGUAGE plpgsql;


DROP TRIGGER "checkATD" ON "pesca"."voyages";
CREATE TRIGGER "checkATD" BEFORE INSERT OR UPDATE OF "atd" ON "pesca"."voyages" 
FOR EACH ROW EXECUTE PROCEDURE "pesca"."checkATD"();