--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pesca; Type: SCHEMA; Schema: -; Owner: inkas
--

CREATE SCHEMA pesca;


ALTER SCHEMA pesca OWNER TO inkas;

SET search_path = pesca, pg_catalog;

--
-- Name: PosWhen(integer, timestamp with time zone); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION "PosWhen"(v_id integer, t timestamp with time zone, OUT _lon double precision, OUT _lat double precision) RETURNS record
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION pesca."PosWhen"(v_id integer, t timestamp with time zone, OUT _lon double precision, OUT _lat double precision) OWNER TO inkas;

--
-- Name: alert_ack(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION alert_ack() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
	NEW.ack_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION pesca.alert_ack() OWNER TO inkas;

--
-- Name: checkATD(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION "checkATD"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
	atd_max	TIMESTAMP WITH TIME ZONE;
BEGIN
	SELECT MAX(atd) INTO atd_max
	FROM pesca.vessels 
	LEFT JOIN pesca.voyages USING(client_id,vessel_id)
	GROUP BY vessel_id
	HAVING vessel_id=NEW.vessel_id;
	
	IF (NEW.atd < atd_max) THEN
		RETURN NULL;
	END IF;
	
	RETURN NEW;
END;
$$;


ALTER FUNCTION pesca."checkATD"() OWNER TO inkas;

--
-- Name: check_ais_positions(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION check_ais_positions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
		PERFORM pesca.check_alarm(alarm_id) 
		FROM pesca.fleet 
		JOIN pesca.alarms ON (vessel_id=entity_id)
		WHERE tstamp IS NOT NULL 
		  AND domain_id = 1000;
        
		BEGIN 
			PERFORM http_post ('https://thiamat.nyxk.com.br:3000/devel/api/1.0/alarms/notify', '', '');
		EXCEPTION WHEN OTHERS THEN END;

		RETURN NULL;
    END;
$$;


ALTER FUNCTION pesca.check_ais_positions() OWNER TO inkas;

--
-- Name: check_alarm(integer); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION check_alarm(_alarm_id integer) RETURNS integer
    LANGUAGE plpgsql STRICT
    AS $$





	BEGIN
		UPDATE pesca.conditions_failed 
			SET checked_last = FALSE
		WHERE alarm_id = _alarm_id;

		INSERT INTO pesca.conditions_failed 
			(condition_id,
			alarm_id,
			alarmtype_id,
			alarmcondition_id,
			entity_id,
			domain_id,
			severity_id,
			geometry_id,
			value_number,
			value_tstamp,
			client_id,
			vessel_id,
			ais_pos,
			ais_vel,
			ais_cog,
			ais_head,
			ais_dest,
			ais_draught,
			ais_tstamp,
			ais_eta,
			condition_message)
		SELECT
			condition_id,
			alarm_id,
			alarmtype_id,
			alarmcondition_id,
			entity_id,
			domain_id,
			severity_id,
			geometry_id,
			value_number,
			value_tstamp,
			client_id,
			vessel_id,
			ais_pos,
			ais_vel,
			ais_cog,
			ais_head,
			ais_dest,
			ais_draught,
			ais_tstamp,
			ais_eta,
			condition_message 
		FROM pesca.status_conditions 
		WHERE alarm_id = _alarm_id AND alarm_active AND condition_status;

		-- INSERT ALL active alarms 
		WITH 
		active AS (
			SELECT alarm_id, is_alert 
			FROM pesca.status_alarms
			WHERE alarm_active AND alarm_status), 

		refresh AS (
			INSERT INTO pesca.alerts(alarm_id, is_alert)
			SELECT alarm_id, is_alert FROM active
			ON CONFLICT DO NOTHING
			RETURNING alarm_id),

		resets AS (
			INSERT INTO pesca.alerts_log(alarm_id,set_at,ack_at,off_at)
			SELECT alarm_id, set_at, ack_at, CURRENT_TIMESTAMP 
			FROM pesca.alerts
			WHERE NOT EXISTS (SELECT alarm_id FROM active WHERE alerts.alarm_id = active.alarm_id)
			ON CONFLICT DO NOTHING
			RETURNING alarm_id)

		DELETE FROM pesca.alerts USING resets WHERE alerts.alarm_id = resets.alarm_id;



		RETURN _alarm_id;
	END;
$$;


ALTER FUNCTION pesca.check_alarm(_alarm_id integer) OWNER TO inkas;

--
-- Name: check_alarms(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION check_alarms() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
		PERFORM pesca.check_alarm(NEW.alarm_id);
		RETURN NEW;
    END;
$$;


ALTER FUNCTION pesca.check_alarms() OWNER TO inkas;

--
-- Name: check_geometries(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION check_geometries() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
		PERFORM pesca.check_alarm(alarm_id) 
			FROM (SELECT DISTINCT alarm_id 
				FROM pesca.conditions 
				JOIN pesca.alarms USING (alarm_id)
				WHERE alarm_active AND geometry_id = NEW.geometry_id) _alarms;	

        RETURN NULL;
    END;
$$;


ALTER FUNCTION pesca.check_geometries() OWNER TO inkas;

--
-- Name: geometry_upsert(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION geometry_upsert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	NEW.geom = ST_SetSRID(ST_GeomFromGeoJSON(NEW.geom_geojson), 3857);
	NEW.entities = ST_NumGeometries(NEW.geom);
	NEW.dimensions = ST_NDims(NEW.geom);
	NEW.geometry_type = GeometryType(NEW.geom);
    RETURN NEW;
END;
$$;


ALTER FUNCTION pesca.geometry_upsert() OWNER TO inkas;

--
-- Name: setLanceDate(); Type: FUNCTION; Schema: pesca; Owner: inkas
--

CREATE FUNCTION "setLanceDate"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
	v_id	INTEGER;
BEGIN
	SELECT vessel_id INTO v_id FROM pesca.voyages WHERE voyage_id=NEW.voyage_id;
	SELECT * INTO NEW.lon, NEW.lat FROM "pesca"."PosWhen"(v_id, NEW.lance_start);

	RETURN NEW;
END;
$$;


ALTER FUNCTION pesca."setLanceDate"() OWNER TO inkas;

--
-- Name: array_accum(anyarray); Type: AGGREGATE; Schema: pesca; Owner: inkas
--

CREATE AGGREGATE array_accum(anyarray) (
    SFUNC = array_cat,
    STYPE = anyarray,
    INITCOND = '{}'
);


ALTER AGGREGATE pesca.array_accum(anyarray) OWNER TO inkas;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: addresses; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE addresses (
    address_id integer NOT NULL,
    logradouro character varying,
    numeral character varying,
    complemento character varying,
    cep character varying,
    cidade character varying,
    estado character varying
);


ALTER TABLE addresses OWNER TO inkas;

--
-- Name: alarmconditions; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE alarmconditions (
    alarmcondition_id integer NOT NULL,
    alarmcondition_desc character varying NOT NULL,
    alarmcondition_caption character varying
);


ALTER TABLE alarmconditions OWNER TO inkas;

--
-- Name: alarmconditions_alarmcondition_id; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE alarmconditions_alarmcondition_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE alarmconditions_alarmcondition_id OWNER TO inkas;

--
-- Name: alarmconditions_alarmcondition_id; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE alarmconditions_alarmcondition_id OWNED BY alarmconditions.alarmcondition_id;


--
-- Name: alarms; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE alarms (
    alarm_id integer NOT NULL,
    alarm_desc character varying NOT NULL,
    alarm_active boolean DEFAULT true NOT NULL,
    severity_id integer DEFAULT 1 NOT NULL,
    weight double precision DEFAULT 1.0 NOT NULL,
    entity_id integer NOT NULL,
    domain_id integer NOT NULL,
    "TopicArn" character varying,
    CONSTRAINT alarms_weight_check CHECK ((weight >= (0)::double precision))
);


ALTER TABLE alarms OWNER TO inkas;

--
-- Name: alarms_alarm_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE alarms_alarm_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE alarms_alarm_id_seq OWNER TO inkas;

--
-- Name: alarms_alarm_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE alarms_alarm_id_seq OWNED BY alarms.alarm_id;


--
-- Name: alarmtype_conditions; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE alarmtype_conditions (
    alarmtype_id integer NOT NULL,
    alarmcondition_id integer NOT NULL
);


ALTER TABLE alarmtype_conditions OWNER TO inkas;

--
-- Name: alarmtypes; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE alarmtypes (
    alarmtype_id integer NOT NULL,
    alarmtype_desc character varying NOT NULL,
    alarmtype_caption character varying NOT NULL,
    domain_id integer NOT NULL
);


ALTER TABLE alarmtypes OWNER TO inkas;

--
-- Name: alarmtypes_alarmtype_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE alarmtypes_alarmtype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE alarmtypes_alarmtype_id_seq OWNER TO inkas;

--
-- Name: alarmtypes_alarmtype_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE alarmtypes_alarmtype_id_seq OWNED BY alarmtypes.alarmtype_id;


--
-- Name: alerts; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE alerts (
    alarm_id integer NOT NULL,
    set_at timestamp with time zone DEFAULT now() NOT NULL,
    ack_at timestamp with time zone,
    ack boolean DEFAULT false NOT NULL,
    is_alert boolean NOT NULL
);


ALTER TABLE alerts OWNER TO inkas;

--
-- Name: alerts_log; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE alerts_log (
    alarm_id integer NOT NULL,
    set_at timestamp with time zone NOT NULL,
    ack_at timestamp with time zone,
    off_at timestamp with time zone NOT NULL
);


ALTER TABLE alerts_log OWNER TO inkas;

--
-- Name: atd_max; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE atd_max (
    max timestamp with time zone
);


ALTER TABLE atd_max OWNER TO inkas;

--
-- Name: attachs; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE attachs (
    store_id integer NOT NULL,
    voyage_id integer NOT NULL
);


ALTER TABLE attachs OWNER TO inkas;

--
-- Name: clients; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE clients (
    client_id integer NOT NULL,
    client_name character varying NOT NULL,
    cnpj character varying,
    address_id integer
);


ALTER TABLE clients OWNER TO inkas;

--
-- Name: clients_client_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE clients_client_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE clients_client_id_seq OWNER TO inkas;

--
-- Name: clients_client_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE clients_client_id_seq OWNED BY clients.client_id;


--
-- Name: conditions; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE conditions (
    alarm_id integer NOT NULL,
    alarmtype_id integer NOT NULL,
    alarmcondition_id integer,
    value_number double precision,
    condition_id integer NOT NULL,
    geometry_id integer,
    value_tstamp timestamp with time zone
);


ALTER TABLE conditions OWNER TO inkas;

--
-- Name: conditions_condition_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE conditions_condition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE conditions_condition_id_seq OWNER TO inkas;

--
-- Name: conditions_condition_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE conditions_condition_id_seq OWNED BY conditions.condition_id;


--
-- Name: conditions_failed; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE conditions_failed (
    alarm_id integer NOT NULL,
    alarmtype_id integer NOT NULL,
    alarmcondition_id integer,
    value_number double precision,
    condition_id integer NOT NULL,
    geometry_id integer,
    value_tstamp timestamp with time zone,
    client_id integer NOT NULL,
    vessel_id integer NOT NULL,
    ais_pos public.geometry,
    ais_vel double precision,
    ais_cog double precision,
    ais_head double precision,
    ais_dest character varying,
    ais_draught double precision,
    checked_at timestamp with time zone DEFAULT now() NOT NULL,
    ais_tstamp timestamp with time zone,
    ais_eta interval,
    alarm_desc character varying,
    alarm_weight double precision,
    severity_id integer NOT NULL,
    entity_id integer NOT NULL,
    domain_id integer NOT NULL,
    checked_last boolean DEFAULT true NOT NULL,
    condition_message character varying
);


ALTER TABLE conditions_failed OWNER TO inkas;

--
-- Name: crew; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE crew (
    voyage_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE crew OWNER TO inkas;

--
-- Name: domains; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE domains (
    domain_id integer NOT NULL,
    domain_desc character varying NOT NULL
);


ALTER TABLE domains OWNER TO inkas;

--
-- Name: fishes; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE fishes (
    fish_id integer NOT NULL,
    fish_name character varying NOT NULL,
    fishingtype_id integer
);


ALTER TABLE fishes OWNER TO inkas;

--
-- Name: fishes_fish_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE fishes_fish_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE fishes_fish_id_seq OWNER TO inkas;

--
-- Name: fishes_fish_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE fishes_fish_id_seq OWNED BY fishes.fish_id;


--
-- Name: fishingtypes; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE fishingtypes (
    fishingtype_id integer NOT NULL,
    fishingtype_desc character varying NOT NULL
);


ALTER TABLE fishingtypes OWNER TO inkas;

--
-- Name: fishingtypes_fishingtype_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE fishingtypes_fishingtype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE fishingtypes_fishingtype_id_seq OWNER TO inkas;

--
-- Name: fishingtypes_fishingtype_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE fishingtypes_fishingtype_id_seq OWNED BY fishingtypes.fishingtype_id;


--
-- Name: geometries; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE geometries (
    geometry_id integer NOT NULL,
    geometry_name character varying NOT NULL,
    geom public.geometry(Geometry,3857) NOT NULL,
    client_id integer NOT NULL,
    entities integer NOT NULL,
    dimensions integer NOT NULL,
    geometry_type character varying NOT NULL,
    geom_geojson character varying NOT NULL
);


ALTER TABLE geometries OWNER TO inkas;

--
-- Name: geometries_geometry_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE geometries_geometry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE geometries_geometry_id_seq OWNER TO inkas;

--
-- Name: geometries_geometry_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE geometries_geometry_id_seq OWNED BY geometries.geometry_id;


--
-- Name: lances; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE lances (
    lance_id integer NOT NULL,
    voyage_id integer NOT NULL,
    fish_id integer NOT NULL,
    weight double precision DEFAULT 0 NOT NULL,
    winddir_id integer DEFAULT 0 NOT NULL,
    wind_id integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    lance_start timestamp with time zone DEFAULT now() NOT NULL,
    temp double precision,
    lance_end timestamp with time zone,
    depth double precision,
    lat double precision,
    lon double precision
);


ALTER TABLE lances OWNER TO inkas;

--
-- Name: lances_lance_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE lances_lance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lances_lance_id_seq OWNER TO inkas;

--
-- Name: lances_lance_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE lances_lance_id_seq OWNED BY lances.lance_id;


--
-- Name: positions; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE positions (
    account character varying NOT NULL,
    esn character varying NOT NULL,
    messagetype character varying,
    messagedetail character varying,
    tstamp integer NOT NULL,
    lat real,
    lon real
);


ALTER TABLE positions OWNER TO inkas;

--
-- Name: vessels; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE vessels (
    vessel_id integer NOT NULL,
    vessel_name character varying NOT NULL,
    client_id integer NOT NULL,
    esn character varying NOT NULL,
    tank_capacity real,
    insc_number character varying,
    insc_issued timestamp with time zone,
    crew_number integer,
    insc_expire timestamp with time zone,
    draught_min real,
    draught_max real,
    ship_breadth real,
    ship_lenght real,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE vessels OWNER TO inkas;

--
-- Name: voyages; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE voyages (
    voyage_id integer NOT NULL,
    voyage_desc character varying,
    eta timestamp with time zone,
    etd timestamp with time zone,
    ata timestamp with time zone,
    atd timestamp with time zone,
    vessel_id integer NOT NULL,
    client_id integer NOT NULL,
    fishingtype_id integer NOT NULL,
    target_fish_id integer NOT NULL,
    master_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voyages_check CHECK ((ata > atd)),
    CONSTRAINT voyages_check1 CHECK ((eta > etd))
);


ALTER TABLE voyages OWNER TO inkas;

--
-- Name: paths; Type: VIEW; Schema: pesca; Owner: inkas
--

CREATE VIEW paths AS
 SELECT voyages.voyage_id,
    to_timestamp((positions.tstamp)::double precision) AS tstamp,
    positions.lat,
    positions.lon
   FROM ((voyages
     JOIN vessels USING (vessel_id))
     JOIN positions USING (esn))
  WHERE ((to_timestamp((positions.tstamp)::double precision) >= COALESCE(voyages.atd, now())) AND (to_timestamp((positions.tstamp)::double precision) <= COALESCE(voyages.ata, now())))
  ORDER BY voyages.voyage_id DESC, (to_timestamp((positions.tstamp)::double precision));


ALTER TABLE paths OWNER TO inkas;

--
-- Name: people; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE people (
    person_id integer NOT NULL,
    person_name character varying,
    client_id integer NOT NULL,
    rgi_number character varying,
    cpf character varying,
    pis character varying,
    birthday timestamp(6) with time zone,
    rgp_number character varying,
    rgp_issued timestamp with time zone,
    rgp_permit integer,
    rgp_expire timestamp with time zone,
    ric_number character varying,
    address_id integer,
    master boolean DEFAULT false NOT NULL,
    rgi_issued character varying,
    rgi_expire timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ric_issued timestamp with time zone,
    ric_expire timestamp with time zone,
    rgi_issuer character varying
);


ALTER TABLE people OWNER TO inkas;

--
-- Name: people_person_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE people_person_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE people_person_id_seq OWNER TO inkas;

--
-- Name: people_person_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE people_person_id_seq OWNED BY people.person_id;


--
-- Name: seascape; Type: VIEW; Schema: pesca; Owner: inkas
--

CREATE VIEW seascape AS
 SELECT DISTINCT ON (positions.esn) vessels.client_id,
    v.voyage_id,
    positions.esn,
    vessels.vessel_id,
    vessels.vessel_name,
    positions.messagetype,
    positions.messagedetail,
    to_timestamp((positions.tstamp)::double precision) AS tstamp,
    positions.lat,
    positions.lon
   FROM (((positions
     JOIN vessels USING (esn))
     JOIN clients USING (client_id))
     JOIN ( SELECT voyages.vessel_id,
            voyages.voyage_id
           FROM voyages
          WHERE ((voyages.atd IS NOT NULL) AND (voyages.ata IS NULL))) v USING (vessel_id))
  WHERE (((positions.lat >= ('-90'::integer)::double precision) AND (positions.lat <= (90)::double precision)) AND ((positions.lon >= ('-180'::integer)::double precision) AND (positions.lon <= (180)::double precision)))
  ORDER BY positions.esn, (to_timestamp((positions.tstamp)::double precision)) DESC;


ALTER TABLE seascape OWNER TO inkas;

--
-- Name: severities; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE severities (
    severity_id integer NOT NULL,
    severity_desc character varying NOT NULL,
    severity_caption character varying NOT NULL,
    is_alert boolean DEFAULT true NOT NULL,
    severity_order integer NOT NULL,
    severity_icon character varying
);


ALTER TABLE severities OWNER TO inkas;

--
-- Name: severities_severity_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE severities_severity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE severities_severity_id_seq OWNER TO inkas;

--
-- Name: severities_severity_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE severities_severity_id_seq OWNED BY severities.severity_id;


--
-- Name: store; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE store (
    size integer NOT NULL,
    mimetype character varying NOT NULL,
    encoding character varying NOT NULL,
    originalname character varying NOT NULL,
    fieldname character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    store_id integer NOT NULL,
    buffer bytea
);


ALTER TABLE store OWNER TO inkas;

--
-- Name: store_store_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE store_store_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE store_store_id_seq OWNER TO inkas;

--
-- Name: store_store_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE store_store_id_seq OWNED BY store.store_id;


--
-- Name: sub_clients; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE sub_clients (
    sub character varying NOT NULL,
    client_id integer NOT NULL
);


ALTER TABLE sub_clients OWNER TO inkas;

--
-- Name: vessels_vessel_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE vessels_vessel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE vessels_vessel_id_seq OWNER TO inkas;

--
-- Name: vessels_vessel_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE vessels_vessel_id_seq OWNED BY vessels.vessel_id;


--
-- Name: voyages_voyage_id_seq; Type: SEQUENCE; Schema: pesca; Owner: inkas
--

CREATE SEQUENCE voyages_voyage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE voyages_voyage_id_seq OWNER TO inkas;

--
-- Name: voyages_voyage_id_seq; Type: SEQUENCE OWNED BY; Schema: pesca; Owner: inkas
--

ALTER SEQUENCE voyages_voyage_id_seq OWNED BY voyages.voyage_id;


--
-- Name: winddir; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE winddir (
    winddir_id integer NOT NULL,
    winddir_desc character varying NOT NULL
);


ALTER TABLE winddir OWNER TO inkas;

--
-- Name: winds; Type: TABLE; Schema: pesca; Owner: inkas
--

CREATE TABLE winds (
    wind_id integer NOT NULL,
    wind_desc character varying NOT NULL
);


ALTER TABLE winds OWNER TO inkas;

--
-- Name: alarmconditions alarmcondition_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmconditions ALTER COLUMN alarmcondition_id SET DEFAULT nextval('alarmconditions_alarmcondition_id'::regclass);


--
-- Name: alarms alarm_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarms ALTER COLUMN alarm_id SET DEFAULT nextval('alarms_alarm_id_seq'::regclass);


--
-- Name: alarmtypes alarmtype_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmtypes ALTER COLUMN alarmtype_id SET DEFAULT nextval('alarmtypes_alarmtype_id_seq'::regclass);


--
-- Name: clients client_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY clients ALTER COLUMN client_id SET DEFAULT nextval('clients_client_id_seq'::regclass);


--
-- Name: conditions condition_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY conditions ALTER COLUMN condition_id SET DEFAULT nextval('conditions_condition_id_seq'::regclass);


--
-- Name: fishes fish_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY fishes ALTER COLUMN fish_id SET DEFAULT nextval('fishes_fish_id_seq'::regclass);


--
-- Name: fishingtypes fishingtype_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY fishingtypes ALTER COLUMN fishingtype_id SET DEFAULT nextval('fishingtypes_fishingtype_id_seq'::regclass);


--
-- Name: geometries geometry_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY geometries ALTER COLUMN geometry_id SET DEFAULT nextval('geometries_geometry_id_seq'::regclass);


--
-- Name: lances lance_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY lances ALTER COLUMN lance_id SET DEFAULT nextval('lances_lance_id_seq'::regclass);


--
-- Name: people person_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY people ALTER COLUMN person_id SET DEFAULT nextval('people_person_id_seq'::regclass);


--
-- Name: severities severity_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY severities ALTER COLUMN severity_id SET DEFAULT nextval('severities_severity_id_seq'::regclass);


--
-- Name: store store_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY store ALTER COLUMN store_id SET DEFAULT nextval('store_store_id_seq'::regclass);


--
-- Name: vessels vessel_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY vessels ALTER COLUMN vessel_id SET DEFAULT nextval('vessels_vessel_id_seq'::regclass);


--
-- Name: voyages voyage_id; Type: DEFAULT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY voyages ALTER COLUMN voyage_id SET DEFAULT nextval('voyages_voyage_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY addresses (address_id, logradouro, numeral, complemento, cep, cidade, estado) FROM stdin;
\.


--
-- Data for Name: alarmconditions; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY alarmconditions (alarmcondition_id, alarmcondition_desc, alarmcondition_caption) FROM stdin;
\.


--
-- Name: alarmconditions_alarmcondition_id; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('alarmconditions_alarmcondition_id', 1, false);


--
-- Data for Name: alarms; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY alarms (alarm_id, alarm_desc, alarm_active, severity_id, weight, entity_id, domain_id, "TopicArn") FROM stdin;
\.


--
-- Name: alarms_alarm_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('alarms_alarm_id_seq', 1, false);


--
-- Data for Name: alarmtype_conditions; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY alarmtype_conditions (alarmtype_id, alarmcondition_id) FROM stdin;
\.


--
-- Data for Name: alarmtypes; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY alarmtypes (alarmtype_id, alarmtype_desc, alarmtype_caption, domain_id) FROM stdin;
\.


--
-- Name: alarmtypes_alarmtype_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('alarmtypes_alarmtype_id_seq', 1, false);


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY alerts (alarm_id, set_at, ack_at, ack, is_alert) FROM stdin;
\.


--
-- Data for Name: alerts_log; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY alerts_log (alarm_id, set_at, ack_at, off_at) FROM stdin;
\.


--
-- Data for Name: atd_max; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY atd_max (max) FROM stdin;
\N
\.


--
-- Data for Name: attachs; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY attachs (store_id, voyage_id) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY clients (client_id, client_name, cnpj, address_id) FROM stdin;
1	Antonio José de Souza	00.000.000/0000-00	\N
2	Miguel Shoiti Kikuchi	00.000.000/0000-00	\N
0	Orbcomm	00.000.000/0000-00	\N
\.


--
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('clients_client_id_seq', 2, true);


--
-- Data for Name: conditions; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY conditions (alarm_id, alarmtype_id, alarmcondition_id, value_number, condition_id, geometry_id, value_tstamp) FROM stdin;
\.


--
-- Name: conditions_condition_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('conditions_condition_id_seq', 1, false);


--
-- Data for Name: conditions_failed; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY conditions_failed (alarm_id, alarmtype_id, alarmcondition_id, value_number, condition_id, geometry_id, value_tstamp, client_id, vessel_id, ais_pos, ais_vel, ais_cog, ais_head, ais_dest, ais_draught, checked_at, ais_tstamp, ais_eta, alarm_desc, alarm_weight, severity_id, entity_id, domain_id, checked_last, condition_message) FROM stdin;
\.


--
-- Data for Name: crew; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY crew (voyage_id, person_id) FROM stdin;
12	1
11	1
11	2
29	7
5	1
11	3
\.


--
-- Data for Name: domains; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY domains (domain_id, domain_desc) FROM stdin;
\.


--
-- Data for Name: fishes; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY fishes (fish_id, fish_name, fishingtype_id) FROM stdin;
1	Abrótea	4
2	Ariacó	4
3	Badejo / Sirigado	4
4	Bagre	4
5	Batata	4
6	Batata-da-pedra	4
7	Besugo	4
8	Bijupirá	4
9	Biquara / Corcoroca / Pirambú	4
10	Budião	4
11	Cação bagre	4
12	Cação gato	4
13	Caranguejo aranha	4
14	Caranguejo real	4
15	Caranguejo vermelho	4
16	Caranha	4
17	Carapitanga / Paramirim / Realito	4
18	Caraúna / Cirurgião	4
19	Cherne galha-amarela	4
20	Cherne listrado	4
21	Cherne poveiro	4
22	Cherne queimado	4
23	Cherne verdadeiro	4
24	Cioba / Sirioba	4
25	Congro	4
26	Congro negro	4
27	Congro rosa	4
28	Dentão / Baúna	4
29	Garoupa gato	4
30	Garoupa verdadeira	4
31	Garoupa vermelha / São-Tomé	4
32	Gostosa / Piranema	4
33	Guaiúba / rabo-amarelo	4
34	Jaguariçá	4
35	Lagosta pintada	4
36	Lagosta sapateira	4
37	Lagosta verde	4
38	Lagosta vermelha	4
39	Mariquita	4
40	Moréia	4
41	Namorado	4
42	Olho-de-cão	4
43	Pargo boca-preta / Sassupema	4
44	Pargo olho-amarelo	4
45	Pargo olhudo	4
46	Pargo rosa	4
47	Pargo verdadeiro	4
48	Peixe pena	4
49	Peixe porco / Peroá / Cangulo	4
50	Piraúna / Catuá / Jabú	4
51	Polvo	4
52	Salema	4
53	Saramunete	4
54	Sarrão 	4
55	Trilha	4
56	Abrótea	11
57	Bagre	11
58	Batata	11
59	Cabrinha	11
60	Cação anjo	11
61	Cação bagre	11
62	Cação bico-doce	11
63	Cação cola-fina	11
64	Cação mangona	11
65	Calamar	11
66	Camarão Barab-Ruça / Ferrinho	11
67	Camarão Branco / Legítimo	11
68	Camarão Carabineiro	11
69	Camarão Rosa	11
70	Camarão Sete Barbas	11
71	Camarão vermelho / Santana	11
72	Caranguejo real 	11
73	Caranguejo vermelho	11
74	Castanha	11
75	Congro	11
76	Congro rosa	11
77	Corvina	11
78	Linguado	11
79	Lula	11
80	Merluza	11
81	Palombeta	11
82	Pargo rosa	11
83	Peixe porco / Peroá	11
84	Peixe-sapo	11
85	Pescada amarela	11
86	Pescada branca	11
87	Pescada cambucu	11
88	Pescada foguete	11
89	Pescada gó	11
90	Pescada goete	11
91	Pescada olhuda / Maria-mole	11
92	Pescadinha	11
93	Pescadinha real	11
94	Polvo	11
95	Raia emplasto	11
96	Trilha	11
97	Viola	11
98	Abrótea	9
99	Abrótea-do-fundo	9
100	Badejo	9
101	Barracuda	9
102	Batata	9
103	Batata-da-pedra	9
104	Cabrinha	9
105	Cação anjo	9
106	Cação bagre	9
107	Cação bico-doce	9
108	Cação frango	9
109	Cação-de-espinho	9
110	Cação machote	9
111	Cação mangona	9
112	Cavala	9
113	Catuá / Garoupinha	9
114	Cherne verdadeiro	9
115	Cherne galha-amarela	9
116	Cherne queimado	9
117	Cherne listrado	9
118	Cherne poveiro	9
119	Cioba / Sirioba	9
120	Congro	9
121	Congro rosa	9
122	Corvina	9
123	Dentão	9
124	Dourado	9
125	Garoupa verdadeira	9
126	Garoupa vermelha / São-Tomé	9
127	Guaiúba / rabo-amarelo	9
128	Lírio	9
129	Merluza	9
130	Mero	9
131	Namorado	9
132	Olhete / Pitangola	9
133	Olho-de-boi	9
134	Olho-de-cão	9
135	Pargo verdadeiro	9
136	Pargo rosa	9
137	Peixe pena	9
138	Peixe porco / Peroá / Cangulo	9
139	Raia	9
140	Vermelho	9
141	Vermelho olho-amarelo	9
142	Viola	9
143	Sarrão	9
144	Xaréu / Xarelete / Carapau	9
145	Abrótea	3
146	Abrótea-do-fundo	3
147	Badejo quadrado	3
148	Badejo mira	3
149	Barracuda	3
150	Bicuda	3
151	Batata	3
152	Batata-da-pedra	3
153	Bonito pintado	3
154	Cação anequim / moro	3
155	Cação anjo	3
156	Cação azul / mole-mole	3
157	Cação bagre	3
158	Cação bico-doce	3
159	Cação cabeça-chata	3
160	Cação cola-fina	3
161	Cação-de-espinho	3
162	Cação frango	3
163	Cação martelo	3
164	Cação machote	3
165	Cação mangona	3
166	Cação viola	3
167	Caranha	3
168	Catuá / Garoupinha	3
169	Cavala	3
170	Cavala empinge	3
171	Cherne verdadeiro	3
172	Cherne galha amarela	3
173	Cherne queimado	3
174	Cherne listrado	3
175	Cherne poveiro	3
176	Cioba	3
177	Congro	3
178	Congro	3
179	Dentão	3
180	Dourado	3
181	Enchova	3
182	Espada	3
183	Garoupa verdadeira	3
184	Garoupa São-Tomé	3
185	Guaiúba	3
186	Lírio	3
187	Mero	3
188	Namorado	3
189	Olho-de-boi	3
190	Olhete / Pitangola	3
191	Pargo rosa	3
192	Peixe porco / Peroá	3
193	Raia	3
194	Realito	3
195	Sarrão	3
196	Vermelho	3
197	Xaréu	3
198	Xarelete / Carapau	3
199	Albacora-bandolim (BET)	7
200	Albacora-branca (ALB)	7
201	Albacora laje (YFT)	7
202	Albacorinha (BLF)	7
203	Bicuda	7
204	Bonito Cachorro	7
205	Bonito Listrado	7
206	Bonito Pintado	7
207	Cavala	7
208	Cavala Empinge (W AH)	7
209	Dourado (DOL)	7
210	Albacora-bandolim (BET)	1
211	Albacora-branca (ALB)	1
212	Albacora-laje (YFT)	1
213	Albacorinha (BLF)	1
214	Bonito-cachorro	1
215	Bonito-listrado (SKJ)	1
216	Bonito-pintado	1
217	Cavala	1
218	Cavala-empinge (W AH)	1
219	Dourado (DOL)	1
220	Anchoíta	5
221	Bicuda	5
222	Bonito cachorro	5
223	Bonito pintado	5
224	Carapau	5
225	Cavalinha	5
226	Corvina	5
227	Dourado	5
228	Enchova	5
229	Espada	5
230	Peixe	5
231	Galo	5
232	Goete	5
233	Gordinho	5
234	Palombeta	5
235	Pescada	5
236	Pescadinha	5
237	Sarda	5
238	Sardinha boca-torta	5
239	Sardinha cascuda	5
240	Sardinha laje	5
241	Sardinha verdadeira	5
242	Savelha	5
243	Serra/Sororoca	5
244	Tainha	5
245	Xaréu	5
246	Xerelete	5
247	Xixarro	5
248	Cação galha-branca	10
249	Cação galha-preta	10
250	Cação galhudo	10
251	Cação lombo preto	10
252	Cação machote	10
253	Cação mangona	10
254	Cação martelo	10
255	Cação martelo-liso	10
256	Cação tigre / Tintureiro	10
257	Cavala	10
258	Cavala empinge	10
259	Dourado	10
260	Espadarte / Meca	10
261	Olho-de-boi / Arabaiana	10
262	Peixe lua	10
263	Peixe prego	10
264	Raia lixa	10
265	Raia manteiga	10
266	Raia chita	10
267	Raia manta	10
268	Sarda	10
269	Serra / Sororoca	10
270	Xaréu	10
271	Agulhão branco (WHM)	8
272	Agulhão negro (BUM)	8
273	Agulhão vela (SAI)	8
274	Albacora Azul (BFT)	8
275	Albacora bandolim (BET)	8
276	Albacora branca (ALB)	8
277	Albacora laje (YFT)	8
278	Albacorinha (BLF)	8
279	Arraia jamanta	8
280	Barracuda	8
281	Cavala empinge (W AH)	8
282	Cavala preta	8
283	Dourado (DOL)	8
284	Espadarte (SWO)	8
285	Peixe prego	8
286	Tubarão azul (BSH)	8
287	Tubarão cachorro	8
288	Tubarão lombo preto (FAL)	8
289	Tubarão mako / anequim (MAK)	8
290	Tubarão martelo(SPX)	8
291	Tubarão raposa (BTH)	8
292	Tubarão tigre	8
293	Calamar argentino	2
294	Lula comum	2
295	Outras	2
296	Arabaiana	6
297	Aracanguira	6
298	Ariacó	6
299	Sirigado	6
300	Barracuda / Goirana	6
301	Batata	6
302	Batata-da-pedra	6
303	Biquara / Pirambú	6
304	Bijupirá	6
305	Cação / Tubarão	6
306	Cação martelo	6
307	Cangulo / Peroá	6
308	Caranha	6
309	Carapitanga / Paramirim	6
310	Cavala	6
311	Cavala empinge	6
312	Cioba / Sirioba	6
313	Corvina	6
314	Cherne verdadeiro	6
315	Cherne galha-amarela	6
316	Cherne queimado	6
317	Cherne listrado	6
318	Dentão	6
319	Dourado	6
320	Graçarim / Guaracimbora	6
321	Garoupa	6
322	Garoupa gato	6
323	Gostosa / Piranema	6
324	Guaiúba / rabo-amarelo	6
325	Guaricema / Guarassuma	6
326	Guarajuba	6
327	Gurijuba	6
328	Mero / Canapú	6
329	Olho-de-boi	6
330	Pargo verdadeiro	6
331	Pargo olho-amarelo	6
332	Pargo boca-preta / Sassupema	6
333	Pargo olhudo	6
334	Peixe pena	6
335	Pescada Amarela	6
336	Pirá	6
337	Piraúna / Jabú / Catuá	6
338	Raia	6
339	Xaréu	6
340	Xaréu preto	6
341	Abrótea	12
342	Bagre	12
343	Baiacu	12
344	Batata	12
345	Batata-da-Pedra	12
346	Betara / Papa-terra	12
347	Cabrinha	12
348	Cação bagre	12
349	Cação bico-doce	12
350	Cação cola-fina	12
351	Cação mangona	12
352	Cação anjo	12
353	Calamar argentino	12
354	Camarão barba-ruça / ferrinho	12
355	Camarão branco / legítimo	12
356	Camarão carabineiro	12
357	Camarão rosa	12
358	Camarão sete barbas	12
359	Camarão vermelho / Santana	12
360	Caranguejo real	12
361	Caranguejo vermelho	12
362	Castanha	12
363	Cavalinha	12
364	Cherne-poveiro	12
365	Cherne-verdadeiro	12
366	Cherne galha-amarela	12
367	Congro-rosa	12
368	Corvina	12
369	Espada	12
370	Galo	12
371	Garoupa	12
372	Goete	12
373	Guaivira	12
374	Linguado	12
375	Lula	12
376	Merluza	12
377	Namorado	12
378	Pargo rosa	12
379	Peixe-porco / Peroá	12
380	Peixe-sapo	12
381	Pescada amarela	12
382	Pescada branca	12
383	Pescada cambucu	12
384	Pescada foguete	12
385	Pescada olhuda/Maria-mole	12
386	Pescadinha real	12
387	Polvo	12
388	Raias	12
389	Roncador	12
390	Sarrão	12
391	Trilha	12
392	Viola	12
393	Xixarro	12
\.


--
-- Name: fishes_fish_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('fishes_fish_id_seq', 393, true);


--
-- Data for Name: fishingtypes; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY fishingtypes (fishingtype_id, fishingtype_desc) FROM stdin;
1	Vara e Isca Viva
2	Iscador Automático
3	Espinhel Vertical
4	Armadilha
5	Rede de Cerco (Sardinha)
7	Rede de Cerco (Bonito)
8	Espinhel de Superfície
9	Espinhel de Fundo
10	Rede de Emalhar de Superfície
12	Arrasto (Peixes Demersais)
11	Arrasto (Camarões)
6	Espinhel Vertical (Pargo)
\.


--
-- Name: fishingtypes_fishingtype_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('fishingtypes_fishingtype_id_seq', 12, true);


--
-- Data for Name: geometries; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY geometries (geometry_id, geometry_name, geom, client_id, entities, dimensions, geometry_type, geom_geojson) FROM stdin;
\.


--
-- Name: geometries_geometry_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('geometries_geometry_id_seq', 1, false);


--
-- Data for Name: lances; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY lances (lance_id, voyage_id, fish_id, weight, winddir_id, wind_id, created_at, lance_start, temp, lance_end, depth, lat, lon) FROM stdin;
7	5	59	12	3	3	2018-05-29 21:34:35.427-03	2018-05-29 21:34:28.116-03	\N	\N	\N	\N	\N
9	12	224	290	3	3	2018-05-30 07:34:12.603-03	2018-05-29 00:10:39-03	9	2018-05-29 16:33:53-03	14	5.836785180568695	-37.7043357658386213
12	12	221	14	3	3	2018-05-31 14:33:21.47-03	2018-05-29 14:32:56-03	\N	\N	18	5.98440163082906462	-37.7539658732649031
15	11	46	15000	3	3	2018-05-31 15:04:16.249-03	2018-05-25 15:03:28-03	\N	\N	\N	4.2486570710166891	-37.739345774931067
13	11	1	1400	3	2	2018-05-31 14:34:28.462-03	2018-05-30 14:34:16-03	\N	\N	\N	6.09328384006146262	-37.656424709202085
\.


--
-- Name: lances_lance_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('lances_lance_id_seq', 15, true);


--
-- Data for Name: people; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY people (person_id, person_name, client_id, rgi_number, cpf, pis, birthday, rgp_number, rgp_issued, rgp_permit, rgp_expire, ric_number, address_id, master, rgi_issued, rgi_expire, created_at, ric_issued, ric_expire, rgi_issuer) FROM stdin;
2	Marcos Santiago	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2018-05-28 17:26:12.12656-03	\N	\N	\N
4	Fabio Pescador	1	\N	\N	\N	2018-05-28 00:00:00-03	\N	\N	\N	\N	\N	\N	t	\N	\N	2018-05-28 17:26:24.413-03	\N	\N	\N
7	Alexandre	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2018-05-29 08:23:38.811-03	\N	\N	\N
9	Pedro Santiago	1	\N	\N	\N	2018-05-08 00:00:00-03	\N	\N	\N	\N	\N	\N	f	\N	\N	2018-05-30 07:35:59.123-03	\N	\N	\N
3	Erick Dourado	1	\N	\N	\N	2018-05-02 00:00:00-03	\N	\N	\N	\N	\N	\N	t	\N	\N	2018-05-28 17:26:12.12656-03	\N	\N	\N
1	Antonio Russo	1	\N	\N	\N	\N	2546	\N	\N	\N	\N	\N	f	\N	\N	2018-05-28 17:26:12.12656-03	\N	\N	SDS SP
\.


--
-- Name: people_person_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('people_person_id_seq', 13, true);


--
-- Data for Name: positions; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY positions (account, esn, messagetype, messagedetail, tstamp, lat, lon) FROM stdin;
arinos	0-2530610	NEWMOVEMENT	MOVIMENTO SPOT	1525428845	-3.74545002	-38.5022583
arinos	0-2530610	UNLIMITED-TRACK		1525429081	-3.74750996	-38.4956093
arinos	0-2530610	UNLIMITED-TRACK		1525429679	-3.77082992	-38.4795494
arinos	0-2530610	UNLIMITED-TRACK		1525429379	-3.7628901	-38.4828987
arinos	0-2530610	UNLIMITED-TRACK		1525430275	-3.77060008	-38.4808693
arinos	0-2530610	UNLIMITED-TRACK		1525429975	-3.77056003	-38.4807816
arinos	0-2530610	STOP		1525430576	-3.77061009	-38.4809608
arinos	0-2530610	NEWMOVEMENT	MOVIMENTO SPOT	1525439622	-3.77276993	-38.4809608
arinos	0-2530610	UNLIMITED-TRACK		1525439919	-3.77291989	-38.4811707
arinos	0-2530610	UNLIMITED-TRACK		1525439619	-3.77278996	-38.480999
arinos	0-2530610	UNLIMITED-TRACK		1525439319	-3.77158999	-38.4841805
arinos	0-2530610	STOP		1525440518	-3.77284002	-38.4811096
arinos	0-2530610	UNLIMITED-TRACK	A bateria do Spot está fraca e precisa ser trocada.	1525441655	-3.74597001	-38.4948997
arinos	0-2530610	UNLIMITED-TRACK		1525453775	-3.74017	-38.5027809
arinos	0-2530610	UNLIMITED-TRACK		1525454025	-3.73650002	-38.5018883
arinos	0-2530610	NEWMOVEMENT	MOVIMENTO SPOT	1525461937	-3.73604012	-38.5023804
arinos	0-2530610	NEWMOVEMENT	MOVIMENTO SPOT	1525466758	-3.74048996	-38.5028687
erick	0-3126007	NEWMOVEMENT	SPOT Trace has detected that the asset has moved.	1525897059	-2.90680003	-39.8861389
erick	0-3126007	UNLIMITED-TRACK		1525897572	-2.92252994	-39.8887596
erick	0-3126007	STOP		1525898764	-2.93068004	-39.8937111
erick	0-3126007	STOP		1525898164	-2.93046999	-39.8937111
erick	0-3126007	UNLIMITED-TRACK		1525901148	-2.92956996	-39.8955994
erick	0-3126007	NEWMOVEMENT	SPOT Trace has detected that the asset has moved.	1525968460	-2.92946005	-39.8956604
erick	0-3126007	STATUS		1526064391	-2.9295001	-39.8956299
erick	0-3126007	NEWMOVEMENT	SPOT Trace has detected that the asset has moved.	1526141458	-2.92963004	-39.8949013
erick	0-3126007	UNLIMITED-TRACK		1526143197	-2.90526009	-39.8853111
erick	0-3126007	UNLIMITED-TRACK		1526146179	-2.90453005	-39.8864403
erick	0-3126007	UNLIMITED-TRACK		1526145579	-2.90495992	-39.8858414
erick	0-3126007	UNLIMITED-TRACK		1526144979	-2.90470004	-39.8855019
erick	0-3126007	STOP		1526147375	-2.90478992	-39.8864098
erick	0-3126007	STOP		1526146775	-2.90478992	-39.8864098
erick	0-3126007	NEWMOVEMENT	SPOT Trace has detected that the asset has moved.	1526155932	-2.90469003	-39.8862
erick	0-3126007	STOP		1526158278	-2.90472007	-39.8862
erick	0-3126007	STOP		1526157678	-2.90472007	-39.8862
erick	0-3126007	STOP		1526157078	-2.90462995	-39.8862915
erick	0-3126007	STATUS		1526316499	-2.90478992	-39.8862
erick	0-3126007	UNLIMITED-TRACK		1527109658	3.92410994	-38.1266785
erick	0-3126007	UNLIMITED-TRACK		1527109058	3.92603993	-38.1264191
erick	0-3126007	UNLIMITED-TRACK		1527110231	3.92298007	-38.126461
erick	0-3126007	UNLIMITED-TRACK		1527110831	3.92178011	-38.1257286
erick	0-3126007	UNLIMITED-TRACK		1527111432	3.9205699	-38.1251793
erick	0-3126007	UNLIMITED-TRACK		1527112026	3.91913009	-38.1248817
erick	0-3126007	UNLIMITED-TRACK		1527113247	3.9167099	-38.1233215
erick	0-3126007	UNLIMITED-TRACK		1527112647	3.91794991	-38.1235809
erick	0-3126007	UNLIMITED-TRACK		1527113814	3.9154799	-38.1231689
erick	0-3126007	UNLIMITED-TRACK		1527114414	3.91458988	-38.1219788
erick	0-3126007	UNLIMITED-TRACK		1527115014	3.91281009	-38.1216698
erick	0-3126007	UNLIMITED-TRACK		1527115611	3.91061997	-38.1217308
erick	0-3126007	UNLIMITED-TRACK		1527117997	3.90161991	-38.1233215
erick	0-3126007	UNLIMITED-TRACK		1527117397	3.90402007	-38.1228104
erick	0-3126007	UNLIMITED-TRACK		1527116797	3.90612006	-38.1228104
erick	0-3126007	UNLIMITED-TRACK		1527118595	3.89931989	-38.1237488
erick	0-3126007	UNLIMITED-TRACK		1527119188	3.89685011	-38.1239586
erick	0-3126007	UNLIMITED-TRACK		1527119787	3.89451003	-38.1245384
erick	0-3126007	UNLIMITED-TRACK		1527120416	3.89280009	-38.1244202
erick	0-3126007	UNLIMITED-TRACK		1527120982	3.89122009	-38.1242409
erick	0-3126007	UNLIMITED-TRACK		1527121576	3.88986993	-38.1235695
erick	0-3126007	UNLIMITED-TRACK		1527122172	3.88753009	-38.1241112
erick	0-3126007	UNLIMITED-TRACK		1527122766	3.88621998	-38.1234093
erick	0-3126007	UNLIMITED-TRACK		1527123362	3.88435006	-38.1233482
erick	0-3126007	UNLIMITED-TRACK		1527124553	3.87949991	-38.1239014
erick	0-3126007	UNLIMITED-TRACK		1527123953	3.88181996	-38.1236382
erick	0-3126007	UNLIMITED-TRACK		1527125741	3.87443995	-38.1245117
erick	0-3126007	UNLIMITED-TRACK		1527125141	3.87705994	-38.1240807
erick	0-3126007	UNLIMITED-TRACK		1527127556	3.86622	-38.1251183
erick	0-3126007	UNLIMITED-TRACK		1527126956	3.86883998	-38.1251183
erick	0-3126007	UNLIMITED-TRACK		1527126356	3.87167001	-38.124691
erick	0-3126007	UNLIMITED-TRACK		1527128124	3.86423993	-38.1247292
erick	0-3126007	UNLIMITED-TRACK		1527128721	3.86152005	-38.1251793
erick	0-3126007	UNLIMITED-TRACK		1527129318	3.85886002	-38.1254616
erick	0-3126007	UNLIMITED-TRACK		1527129913	3.85665989	-38.125
erick	0-3126007	UNLIMITED-TRACK		1527130512	3.85384989	-38.1247597
erick	0-3126007	UNLIMITED-TRACK		1527131125	3.85078001	-38.1243286
erick	0-3126007	UNLIMITED-TRACK		1527131706	3.84776998	-38.1242409
erick	0-3126007	UNLIMITED-TRACK		1527132302	3.8447299	-38.1238098
erick	0-3126007	UNLIMITED-TRACK		1527132900	3.84206009	-38.1236
erick	0-3126007	UNLIMITED-TRACK		1527133496	3.8392601	-38.1231117
erick	0-3126007	UNLIMITED-TRACK		1527134728	3.83332992	-38.1222496
erick	0-3126007	UNLIMITED-TRACK		1527134128	3.83642006	-38.1223412
erick	0-3126007	UNLIMITED-TRACK		1527135288	3.83062005	-38.1221008
erick	0-3126007	UNLIMITED-TRACK		1527135889	3.82856011	-38.1214905
erick	0-3126007	UNLIMITED-TRACK		1527136488	3.82602	-38.1207314
erick	0-3126007	UNLIMITED-TRACK		1527137089	3.82445002	-38.1195984
erick	0-3126007	UNLIMITED-TRACK		1527138324	3.82016993	-38.1195107
erick	0-3126007	UNLIMITED-TRACK		1527137724	3.82261992	-38.1194191
erick	0-3126007	UNLIMITED-TRACK		1527138890	3.81804991	-38.1193199
erick	0-3126007	UNLIMITED-TRACK		1527139480	3.81640005	-38.1189919
erick	0-3126007	UNLIMITED-TRACK		1527140070	3.81466007	-38.118679
erick	0-3126007	UNLIMITED-TRACK		1527140663	3.81307006	-38.1185608
erick	0-3126007	UNLIMITED-TRACK		1527141256	3.81068993	-38.1184082
erick	0-3126007	UNLIMITED-TRACK		1527141877	3.80899	-38.1187401
erick	0-3126007	UNLIMITED-TRACK		1527142454	3.80751991	-38.1184082
erick	0-3126007	UNLIMITED-TRACK		1527143051	3.80969	-38.1186218
erick	0-3126007	UNLIMITED-TRACK		1527144250	3.83058	-38.1286316
erick	0-3126007	UNLIMITED-TRACK		1527143650	3.82259989	-38.1251984
erick	0-3126007	UNLIMITED-TRACK		1527144847	3.82999992	-38.1278114
erick	0-3126007	UNLIMITED-TRACK		1527146646	3.82482004	-38.1294289
erick	0-3126007	UNLIMITED-TRACK		1527146046	3.82893991	-38.1266785
erick	0-3126007	UNLIMITED-TRACK		1527145446	3.82993007	-38.1273689
erick	0-3126007	UNLIMITED-TRACK		1527147241	3.81862998	-38.1344604
erick	0-3126007	UNLIMITED-TRACK		1527147837	3.8162601	-38.1399498
erick	0-3126007	UNLIMITED-TRACK		1527148431	3.82052994	-38.1456604
erick	0-3126007	UNLIMITED-TRACK		1527149064	3.82437992	-38.1521606
erick	0-3126007	UNLIMITED-TRACK		1527150220	3.83271003	-38.1423302
erick	0-3126007	UNLIMITED-TRACK		1527150819	3.83703995	-38.1357117
erick	0-3126007	UNLIMITED-TRACK		1527149619	3.82897997	-38.1491013
erick	0-3126007	UNLIMITED-TRACK		1527151418	3.84194994	-38.130249
erick	0-3126007	UNLIMITED-TRACK		1527152012	3.84528995	-38.1239319
erick	0-3126007	UNLIMITED-TRACK		1527153203	3.85178995	-38.1114807
erick	0-3126007	UNLIMITED-TRACK		1527152603	3.84849	-38.11689
erick	0-3126007	UNLIMITED-TRACK		1527153804	3.85501003	-38.1077614
erick	0-3126007	UNLIMITED-TRACK		1527154399	3.85798001	-38.1030006
erick	0-3126007	UNLIMITED-TRACK		1527154999	3.86144996	-38.0988197
erick	0-3126007	UNLIMITED-TRACK		1527155598	3.86544991	-38.0934792
erick	0-3126007	UNLIMITED-TRACK		1527156793	3.8729701	-38.0834389
erick	0-3126007	UNLIMITED-TRACK		1527156193	3.86966991	-38.0884209
erick	0-3126007	UNLIMITED-TRACK		1527157391	3.87591004	-38.07901
erick	0-3126007	UNLIMITED-TRACK		1527157995	3.87823009	-38.0750999
erick	0-3126007	UNLIMITED-TRACK		1527159181	3.88520002	-38.0633888
erick	0-3126007	UNLIMITED-TRACK		1527158581	3.8815999	-38.0693092
erick	0-3126007	UNLIMITED-TRACK		1527160385	3.89163995	-38.0523109
erick	0-3126007	UNLIMITED-TRACK		1527159785	3.8884201	-38.0575485
erick	0-3126007	UNLIMITED-TRACK		1527160973	3.8952601	-38.0470314
erick	0-3126007	UNLIMITED-TRACK		1527161567	3.89905	-38.0421104
erick	0-3126007	UNLIMITED-TRACK		1527162166	3.90268993	-38.0372314
erick	0-3126007	UNLIMITED-TRACK		1527162761	3.90588999	-38.0323181
erick	0-3126007	UNLIMITED-TRACK		1527163377	3.90936995	-38.0279503
erick	0-3126007	UNLIMITED-TRACK		1527163956	3.91173005	-38.0236816
erick	0-3126007	UNLIMITED-TRACK		1527164564	3.91438007	-38.0187416
erick	0-3126007	UNLIMITED-TRACK		1527165151	3.91722012	-38.0134583
erick	0-3126007	UNLIMITED-TRACK		1527165751	3.91973996	-38.0085793
erick	0-3126007	UNLIMITED-TRACK		1527166348	3.92219996	-38.0032005
erick	0-3126007	UNLIMITED-TRACK		1527166977	3.92481995	-37.9979897
erick	0-3126007	UNLIMITED-TRACK		1527167544	3.9282701	-37.9933815
erick	0-3126007	UNLIMITED-TRACK		1527168142	3.93211007	-37.989109
erick	0-3126007	UNLIMITED-TRACK		1527169344	3.94059992	-37.9825096
erick	0-3126007	UNLIMITED-TRACK		1527168744	3.93638992	-37.9853401
erick	0-3126007	UNLIMITED-TRACK		1527169942	3.94390988	-37.9779396
erick	0-3126007	UNLIMITED-TRACK		1527171738	3.95467997	-37.9621582
erick	0-3126007	UNLIMITED-TRACK		1527171138	3.95120001	-37.9673119
erick	0-3126007	UNLIMITED-TRACK		1527170538	3.94790006	-37.9723701
erick	0-3126007	UNLIMITED-TRACK		1527172335	3.95847011	-37.9569397
erick	0-3126007	UNLIMITED-TRACK		1527173531	3.96532011	-37.9461098
erick	0-3126007	UNLIMITED-TRACK		1527172931	3.96193004	-37.9519501
erick	0-3126007	UNLIMITED-TRACK		1527174729	3.97182989	-37.9364014
erick	0-3126007	UNLIMITED-TRACK		1527174129	3.9686501	-37.940609
erick	0-3126007	UNLIMITED-TRACK		1527175926	3.97976995	-37.9277611
erick	0-3126007	UNLIMITED-TRACK		1527175326	3.97617006	-37.9319687
erick	0-3126007	UNLIMITED-TRACK		1527177144	3.98661995	-37.918911
erick	0-3126007	UNLIMITED-TRACK		1527176544	3.98305988	-37.9230309
erick	0-3126007	UNLIMITED-TRACK		1527179505	4.00213003	-37.8988609
erick	0-3126007	UNLIMITED-TRACK		1527178905	3.99792004	-37.9033203
erick	0-3126007	UNLIMITED-TRACK		1527178305	3.99376011	-37.9082985
erick	0-3126007	UNLIMITED-TRACK		1527180700	4.01154995	-37.8904991
erick	0-3126007	UNLIMITED-TRACK		1527180100	4.00683022	-37.8943596
erick	0-3126007	UNLIMITED-TRACK		1527181897	4.02090979	-37.8823891
erick	0-3126007	UNLIMITED-TRACK		1527181297	4.01648998	-37.8861694
erick	0-3126007	UNLIMITED-TRACK		1527182496	4.02498007	-37.8786316
erick	0-3126007	UNLIMITED-TRACK		1527183691	4.0331502	-37.8699303
erick	0-3126007	UNLIMITED-TRACK		1527183091	4.02916002	-37.8743896
erick	0-3126007	UNLIMITED-TRACK		1527184288	4.03647995	-37.8659706
erick	0-3126007	UNLIMITED-TRACK		1527184915	4.03955984	-37.86166
erick	0-3126007	UNLIMITED-TRACK		1527185485	4.04271984	-37.8565102
erick	0-3126007	UNLIMITED-TRACK		1527186084	4.0468502	-37.8515587
erick	0-3126007	UNLIMITED-TRACK		1527187277	4.05420017	-37.8420105
erick	0-3126007	UNLIMITED-TRACK		1527186677	4.05064011	-37.8465614
erick	0-3126007	UNLIMITED-TRACK		1527188496	4.06140995	-37.8323402
erick	0-3126007	UNLIMITED-TRACK		1527187896	4.05792999	-37.8377495
erick	0-3126007	UNLIMITED-TRACK		1527189070	4.06442022	-37.8278503
erick	0-3126007	UNLIMITED-TRACK		1527189669	4.06789017	-37.8243408
erick	0-3126007	UNLIMITED-TRACK		1527190262	4.07273006	-37.8211098
erick	0-3126007	UNLIMITED-TRACK		1527190858	4.07776022	-37.8173485
erick	0-3126007	UNLIMITED-TRACK		1527192086	4.08550978	-37.80933
erick	0-3126007	UNLIMITED-TRACK		1527191486	4.08164978	-37.8134499
erick	0-3126007	UNLIMITED-TRACK		1527193244	4.09303999	-37.8008995
erick	0-3126007	UNLIMITED-TRACK		1527192644	4.08896017	-37.8059616
erick	0-3126007	UNLIMITED-TRACK		1527194443	4.10036993	-37.7923584
erick	0-3126007	UNLIMITED-TRACK		1527195040	4.10333014	-37.7892189
erick	0-3126007	UNLIMITED-TRACK		1527193840	4.09732008	-37.7964287
erick	0-3126007	UNLIMITED-TRACK		1527195655	4.10634995	-37.7858009
erick	0-3126007	UNLIMITED-TRACK		1527196237	4.10878992	-37.7821693
erick	0-3126007	UNLIMITED-TRACK		1527197434	4.11485004	-37.7743492
erick	0-3126007	UNLIMITED-TRACK		1527196834	4.11184978	-37.7783012
erick	0-3126007	UNLIMITED-TRACK		1527198632	4.12157011	-37.76688
erick	0-3126007	UNLIMITED-TRACK		1527198032	4.11821985	-37.7703094
erick	0-3126007	UNLIMITED-TRACK		1527201031	4.13145018	-37.7526207
erick	0-3126007	UNLIMITED-TRACK		1527200431	4.12938976	-37.7557106
erick	0-3126007	UNLIMITED-TRACK		1527199831	4.12759018	-37.7593117
erick	0-3126007	UNLIMITED-TRACK		1527203420	4.13980007	-37.7361794
erick	0-3126007	UNLIMITED-TRACK		1527205811	4.14900017	-37.7238503
erick	0-3126007	UNLIMITED-TRACK		1527205211	4.14697981	-37.7278786
erick	0-3126007	UNLIMITED-TRACK		1527204611	4.14398003	-37.7299385
erick	0-3126007	UNLIMITED-TRACK		1527206425	4.15173006	-37.7198486
erick	0-3126007	UNLIMITED-TRACK		1527207005	4.15493011	-37.7164917
erick	0-3126007	UNLIMITED-TRACK		1527207600	4.15830994	-37.7122803
erick	0-3126007	UNLIMITED-TRACK		1527208198	4.1610198	-37.7087097
erick	0-3126007	UNLIMITED-TRACK		1527208796	4.16399002	-37.7049599
erick	0-3126007	UNLIMITED-TRACK		1527209397	4.1672802	-37.7009888
erick	0-3126007	UNLIMITED-TRACK		1527210596	4.17448997	-37.6933289
erick	0-3126007	UNLIMITED-TRACK		1527209996	4.17110014	-37.6966782
erick	0-3126007	UNLIMITED-TRACK		1527211195	4.17674017	-37.6893616
erick	0-3126007	UNLIMITED-TRACK		1527211797	4.18023014	-37.685421
erick	0-3126007	UNLIMITED-TRACK		1527212396	4.18377018	-37.6817017
erick	0-3126007	UNLIMITED-TRACK		1527212992	4.18614006	-37.6779785
erick	0-3126007	UNLIMITED-TRACK		1527213626	4.18825006	-37.6739502
erick	0-3126007	UNLIMITED-TRACK		1527214786	4.19383001	-37.671299
erick	0-3126007	UNLIMITED-TRACK		1527214186	4.19083023	-37.6725006
erick	0-3126007	UNLIMITED-TRACK		1527215385	4.19671011	-37.6698303
erick	0-3126007	UNLIMITED-TRACK		1527216574	4.20297003	-37.6663513
erick	0-3126007	UNLIMITED-TRACK		1527215974	4.20043993	-37.6680717
erick	0-3126007	UNLIMITED-TRACK		1527217194	4.2056098	-37.6647911
erick	0-3126007	UNLIMITED-TRACK		1527217767	4.2087698	-37.6626282
erick	0-3126007	UNLIMITED-TRACK		1527218363	4.21158981	-37.6597595
erick	0-3126007	UNLIMITED-TRACK		1527218962	4.21349001	-37.6556091
erick	0-3126007	UNLIMITED-TRACK		1527219558	4.21563005	-37.6514587
erick	0-3126007	UNLIMITED-TRACK		1527220154	4.21748018	-37.6469688
erick	0-3126007	UNLIMITED-TRACK		1527220775	4.2200098	-37.6428185
erick	0-3126007	UNLIMITED-TRACK		1527221354	4.21919012	-37.6432495
erick	0-3126007	UNLIMITED-TRACK		1527221951	4.21729994	-37.6473999
erick	0-3126007	UNLIMITED-TRACK		1527223144	4.21442986	-37.6557617
erick	0-3126007	UNLIMITED-TRACK		1527222544	4.21588993	-37.6513786
erick	0-3126007	UNLIMITED-TRACK		1527223743	4.21306992	-37.6600609
erick	0-3126007	UNLIMITED-TRACK		1527224937	4.21436024	-37.6722717
erick	0-3126007	UNLIMITED-TRACK		1527224337	4.21144009	-37.6645508
erick	0-3126007	UNLIMITED-TRACK		1527225532	4.21818018	-37.6807899
erick	0-3126007	UNLIMITED-TRACK		1527226132	4.21653986	-37.6915894
erick	0-3126007	UNLIMITED-TRACK		1527227330	4.21231985	-37.7133789
erick	0-3126007	UNLIMITED-TRACK		1527226730	4.21635008	-37.7027397
erick	0-3126007	UNLIMITED-TRACK		1527227967	4.20775986	-37.7247581
erick	0-3126007	UNLIMITED-TRACK		1527228528	4.20368004	-37.7353783
erick	0-3126007	UNLIMITED-TRACK		1527229126	4.20242023	-37.7460899
erick	0-3126007	UNLIMITED-TRACK		1527229724	4.20235014	-37.7567711
erick	0-3126007	UNLIMITED-TRACK		1527230324	4.20239019	-37.7671814
erick	0-3126007	UNLIMITED-TRACK		1527230924	4.20122004	-37.7744102
erick	0-3126007	UNLIMITED-TRACK		1527232118	4.19812012	-37.7871399
erick	0-3126007	UNLIMITED-TRACK		1527231518	4.19816017	-37.7785606
erick	0-3126007	UNLIMITED-TRACK		1527232713	4.1983099	-37.7984314
erick	0-3126007	UNLIMITED-TRACK		1527233310	4.19741011	-37.8105812
erick	0-3126007	UNLIMITED-TRACK		1527233907	4.19861984	-37.8222008
erick	0-3126007	UNLIMITED-TRACK		1527234503	4.19876003	-37.8336792
erick	0-3126007	UNLIMITED-TRACK		1527235135	4.1976099	-37.8433189
erick	0-3126007	UNLIMITED-TRACK		1527235695	4.19475985	-37.8464088
erick	0-3126007	UNLIMITED-TRACK		1527236292	4.19161987	-37.8499794
erick	0-3126007	UNLIMITED-TRACK		1527237484	4.18696022	-37.8591003
erick	0-3126007	UNLIMITED-TRACK		1527236884	4.18893003	-37.8543816
erick	0-3126007	UNLIMITED-TRACK		1527238079	4.18470001	-37.8638611
erick	0-3126007	UNLIMITED-TRACK		1527238705	4.18337011	-37.8682899
erick	0-3126007	UNLIMITED-TRACK		1527239277	4.18177986	-37.8725586
erick	0-3126007	UNLIMITED-TRACK		1527239871	4.17984009	-37.8766518
erick	0-3126007	UNLIMITED-TRACK		1527240469	4.17787981	-37.8809814
erick	0-3126007	UNLIMITED-TRACK		1527241064	4.17383003	-37.8869019
erick	0-3126007	UNLIMITED-TRACK		1527241269	4.17158985	-37.8897095
erick	0-3126007	UNLIMITED-TRACK		1527241664	4.16695976	-37.8945007
erick	0-3126007	UNLIMITED-TRACK		1527242286	4.16090012	-37.903141
erick	0-3126007	UNLIMITED-TRACK		1527243463	4.15046978	-37.9181786
erick	0-3126007	UNLIMITED-TRACK		1527242863	4.15479994	-37.9101105
erick	0-3126007	UNLIMITED-TRACK		1527244059	4.1479001	-37.9240685
erick	0-3126007	UNLIMITED-TRACK		1527244655	4.14522982	-37.9267006
erick	0-3126007	UNLIMITED-TRACK		1527245254	4.14222002	-37.9298401
erick	0-3126007	UNLIMITED-TRACK		1527245877	4.14027977	-37.9315186
erick	0-3126007	UNLIMITED-TRACK		1527246455	4.14232016	-37.9266396
erick	0-3126007	UNLIMITED-TRACK		1527247056	4.1379199	-37.9333801
erick	0-3126007	UNLIMITED-TRACK		1527247654	4.14073992	-37.929081
erick	0-3126007	UNLIMITED-TRACK		1527248254	4.14372015	-37.9238281
erick	0-3126007	UNLIMITED-TRACK		1527248851	4.14636993	-37.9183998
erick	0-3126007	UNLIMITED-TRACK		1527249478	4.1494298	-37.9132996
erick	0-3126007	UNLIMITED-TRACK		1527250047	4.15186024	-37.9087181
erick	0-3126007	UNLIMITED-TRACK		1527250647	4.15460014	-37.9039307
erick	0-3126007	UNLIMITED-TRACK		1527251243	4.15761995	-37.8986206
erick	0-3126007	UNLIMITED-TRACK		1527251839	4.16044998	-37.8940086
erick	0-3126007	UNLIMITED-TRACK		1527252437	4.16336012	-37.8898582
erick	0-3126007	UNLIMITED-TRACK		1527253629	4.16972017	-37.8815002
erick	0-3126007	UNLIMITED-TRACK		1527253029	4.16632986	-37.8853607
erick	0-3126007	UNLIMITED-TRACK		1527254820	4.17592001	-37.8727684
erick	0-3126007	UNLIMITED-TRACK		1527254220	4.17308998	-37.8770599
erick	0-3126007	UNLIMITED-TRACK		1527256018	4.18095016	-37.8646202
erick	0-3126007	UNLIMITED-TRACK		1527255418	4.17846012	-37.8689995
erick	0-3126007	UNLIMITED-TRACK		1527257218	4.18524981	-37.855011
erick	0-3126007	UNLIMITED-TRACK		1527256618	4.18306017	-37.8594704
erick	0-3126007	UNLIMITED-TRACK		1527257814	4.18771982	-37.8508911
erick	0-3126007	UNLIMITED-TRACK		1527258411	4.19019985	-37.8461914
erick	0-3126007	UNLIMITED-TRACK		1527259011	4.19253016	-37.8415489
erick	0-3126007	UNLIMITED-TRACK		1527261391	4.20308018	-37.820919
erick	0-3126007	UNLIMITED-TRACK		1527260791	4.20016003	-37.8253784
erick	0-3126007	UNLIMITED-TRACK		1527260191	4.19737005	-37.8310394
erick	0-3126007	UNLIMITED-TRACK		1527260797	4.20014	-37.8254089
erick	0-3126007	UNLIMITED-TRACK		1527262584	4.20824003	-37.8088989
erick	0-3126007	UNLIMITED-TRACK		1527261984	4.20592022	-37.8149109
erick	0-3126007	UNLIMITED-TRACK		1527261384	4.20312977	-37.820919
erick	0-3126007	UNLIMITED-TRACK		1527263820	4.21548986	-37.7992897
erick	0-3126007	UNLIMITED-TRACK		1527263220	4.21146011	-37.8041801
erick	0-3126007	UNLIMITED-TRACK		1527264373	4.21763992	-37.7950096
erick	0-3126007	UNLIMITED-TRACK		1527264973	4.21927977	-37.7906799
erick	0-3126007	UNLIMITED-TRACK		1527265568	4.22217989	-37.7862892
erick	0-3126007	UNLIMITED-TRACK		1527266164	4.22473001	-37.7815208
erick	0-3126007	UNLIMITED-TRACK		1527266762	4.22810984	-37.7768211
erick	0-3126007	UNLIMITED-TRACK		1527267385	4.23180008	-37.7717018
erick	0-3126007	UNLIMITED-TRACK		1527267958	4.23590994	-37.7677002
erick	0-3126007	UNLIMITED-TRACK		1527268556	4.23836994	-37.7623596
erick	0-3126007	UNLIMITED-TRACK		1527269750	4.24406004	-37.7529907
erick	0-3126007	UNLIMITED-TRACK		1527269150	4.24136019	-37.7575417
erick	0-3126007	UNLIMITED-TRACK		1527270349	4.24672985	-37.7484703
erick	0-3126007	UNLIMITED-TRACK		1527270985	4.24778986	-37.7428894
erick	0-3126007	UNLIMITED-TRACK		1527271546	4.24893999	-37.7381897
erick	0-3126007	UNLIMITED-TRACK		1527272146	4.25012016	-37.732151
erick	0-3126007	UNLIMITED-TRACK		1527272744	4.25144005	-37.7262917
erick	0-3126007	UNLIMITED-TRACK		1527273942	4.25651979	-37.7140808
erick	0-3126007	UNLIMITED-TRACK		1527273342	4.25395012	-37.7204285
erick	0-3126007	UNLIMITED-TRACK		1527274567	4.25843	-37.707119
erick	0-3126007	UNLIMITED-TRACK		1527275140	4.26022005	-37.7004395
erick	0-3126007	UNLIMITED-TRACK		1527275736	4.26353979	-37.6937904
erick	0-3126007	UNLIMITED-TRACK		1527276338	4.26676989	-37.6864014
erick	0-3126007	UNLIMITED-TRACK		1527277530	4.27532005	-37.6735191
erick	0-3126007	UNLIMITED-TRACK		1527276930	4.27107	-37.6796989
erick	0-3126007	UNLIMITED-TRACK		1527278155	4.28017998	-37.6672401
erick	0-3126007	UNLIMITED-TRACK		1527279319	4.28576994	-37.6529808
erick	0-3126007	UNLIMITED-TRACK		1527278719	4.28254986	-37.660099
erick	0-3126007	UNLIMITED-TRACK		1527279916	4.28944016	-37.6460609
erick	0-3126007	UNLIMITED-TRACK		1527280514	4.2933898	-37.6400795
erick	0-3126007	UNLIMITED-TRACK		1527281110	4.29617977	-37.6341591
erick	0-3126007	UNLIMITED-TRACK		1527281726	4.29873991	-37.6274681
erick	0-3126007	UNLIMITED-TRACK		1527282305	4.30136013	-37.621769
erick	0-3126007	UNLIMITED-TRACK		1527282903	4.30361986	-37.6157799
erick	0-3126007	UNLIMITED-TRACK		1527283499	4.30608988	-37.6098595
erick	0-3126007	UNLIMITED-TRACK		1527284694	4.31688023	-37.5998802
erick	0-3126007	UNLIMITED-TRACK		1527284094	4.31156015	-37.6049385
erick	0-3126007	UNLIMITED-TRACK		1527285325	4.32239008	-37.5942116
erick	0-3126007	UNLIMITED-TRACK		1527285890	4.32607985	-37.5885887
erick	0-3126007	UNLIMITED-TRACK		1527286490	4.32963991	-37.5822411
erick	0-3126007	UNLIMITED-TRACK		1527287087	4.33049011	-37.5758095
erick	0-3126007	UNLIMITED-TRACK		1527287684	4.32951021	-37.5677185
erick	0-3126007	UNLIMITED-TRACK		1527288284	4.33033991	-37.5608788
erick	0-3126007	UNLIMITED-TRACK		1527290674	4.33350992	-37.5325317
erick	0-3126007	UNLIMITED-TRACK		1527291272	4.33441019	-37.5260582
erick	0-3126007	UNLIMITED-TRACK		1527291867	4.33608007	-37.5197105
erick	0-3126007	UNLIMITED-TRACK		1527292496	4.33717012	-37.5152016
erick	0-3126007	UNLIMITED-TRACK		1527293070	4.33581018	-37.5186806
erick	0-3126007	UNLIMITED-TRACK		1527294267	4.33189011	-37.5265503
erick	0-3126007	UNLIMITED-TRACK		1527293667	4.33377981	-37.5225983
erick	0-3126007	UNLIMITED-TRACK		1527294867	4.32964993	-37.5305481
erick	0-3126007	UNLIMITED-TRACK		1527295462	4.32784986	-37.5335999
erick	0-3126007	UNLIMITED-TRACK		1527296094	4.32551003	-37.537571
erick	0-3126007	UNLIMITED-TRACK		1527297253	4.3217802	-37.5447998
erick	0-3126007	UNLIMITED-TRACK		1527296653	4.32396984	-37.541111
erick	0-3126007	UNLIMITED-TRACK		1527298455	4.31899977	-37.5520897
erick	0-3126007	UNLIMITED-TRACK		1527297855	4.32033014	-37.5488281
erick	0-3126007	UNLIMITED-TRACK		1527299057	4.31754017	-37.5558205
erick	0-3126007	UNLIMITED-TRACK		1527300252	4.31412983	-37.562439
erick	0-3126007	UNLIMITED-TRACK		1527299652	4.31567001	-37.5594406
erick	0-3126007	UNLIMITED-TRACK		1527300848	4.31232977	-37.5661583
erick	0-3126007	UNLIMITED-TRACK		1527301445	4.31064987	-37.5691795
erick	0-3126007	UNLIMITED-TRACK		1527302039	4.30884981	-37.5721092
erick	0-3126007	UNLIMITED-TRACK		1527302636	4.3066802	-37.5753784
erick	0-3126007	UNLIMITED-TRACK		1527303266	4.30481005	-37.5791016
erick	0-3126007	UNLIMITED-TRACK		1527304421	4.30115986	-37.5862694
erick	0-3126007	UNLIMITED-TRACK		1527303821	4.30287981	-37.5823212
erick	0-3126007	UNLIMITED-TRACK		1527305616	4.29859018	-37.593811
erick	0-3126007	UNLIMITED-TRACK		1527306216	4.29701996	-37.5980492
erick	0-3126007	UNLIMITED-TRACK		1527305016	4.29998016	-37.5899811
erick	0-3126007	UNLIMITED-TRACK		1527307408	4.29360008	-37.6057701
erick	0-3126007	UNLIMITED-TRACK		1527306808	4.29532003	-37.6019096
erick	0-3126007	UNLIMITED-TRACK		1527308007	4.29191017	-37.6097412
erick	0-3126007	UNLIMITED-TRACK		1527309202	4.28869009	-37.6172791
erick	0-3126007	UNLIMITED-TRACK		1527308602	4.29015017	-37.6135902
erick	0-3126007	UNLIMITED-TRACK		1527309799	4.28718996	-37.6208191
erick	0-3126007	UNLIMITED-TRACK		1527310435	4.28547001	-37.624691
erick	0-3126007	UNLIMITED-TRACK		1527311595	4.28268003	-37.6312599
erick	0-3126007	UNLIMITED-TRACK		1527310995	4.28400993	-37.6276588
erick	0-3126007	UNLIMITED-TRACK		1527312194	4.28228998	-37.6422386
erick	0-3126007	UNLIMITED-TRACK		1527312796	4.28458023	-37.6534386
erick	0-3126007	UNLIMITED-TRACK		1527313390	4.28645992	-37.6642189
erick	0-3126007	UNLIMITED-TRACK		1527314012	4.2891202	-37.6749916
erick	0-3126007	UNLIMITED-TRACK		1527315183	4.29413986	-37.6952209
erick	0-3126007	UNLIMITED-TRACK		1527314583	4.2902298	-37.68647
erick	0-3126007	UNLIMITED-TRACK		1527315782	4.29750013	-37.7045288
erick	0-3126007	UNLIMITED-TRACK		1527316377	4.30035019	-37.7137794
erick	0-3126007	UNLIMITED-TRACK		1527317607	4.30451012	-37.7329712
erick	0-3126007	UNLIMITED-TRACK		1527317007	4.30236006	-37.7234383
erick	0-3126007	UNLIMITED-TRACK		1527318171	4.30568981	-37.7424011
erick	0-3126007	UNLIMITED-TRACK		1527318771	4.30764008	-37.7522011
erick	0-3126007	UNLIMITED-TRACK		1527319369	4.31025982	-37.7611389
erick	0-3126007	UNLIMITED-TRACK		1527320563	4.31422997	-37.7803993
erick	0-3126007	UNLIMITED-TRACK		1527319963	4.31272984	-37.7702713
erick	0-3126007	UNLIMITED-TRACK		1527321174	4.31569004	-37.7905884
erick	0-3126007	UNLIMITED-TRACK		1527321755	4.31469011	-37.7957802
erick	0-3126007	UNLIMITED-TRACK		1527322354	4.31304979	-37.7989502
erick	0-3126007	UNLIMITED-TRACK		1527322969	4.31188011	-37.801609
erick	0-3126007	UNLIMITED-TRACK		1527324153	4.31225014	-37.8086205
erick	0-3126007	UNLIMITED-TRACK		1527323553	4.31195021	-37.8048401
erick	0-3126007	UNLIMITED-TRACK		1527324777	4.31291008	-37.8126793
erick	0-3126007	UNLIMITED-TRACK		1527325368	4.31286001	-37.8162498
erick	0-3126007	UNLIMITED-TRACK		1527327696	4.31001997	-37.8319092
erick	0-3126007	UNLIMITED-TRACK		1527327096	4.31108999	-37.8291588
erick	0-3126007	UNLIMITED-TRACK		1527326496	4.31134987	-37.8278694
erick	0-3126007	UNLIMITED-TRACK		1527327747	4.30981016	-37.832489
erick	0-3126007	UNLIMITED-TRACK		1527328946	4.30733013	-37.84161
erick	0-3126007	UNLIMITED-TRACK		1527328346	4.3084898	-37.8368912
erick	0-3126007	UNLIMITED-TRACK		1527330134	4.29863977	-37.8573914
erick	0-3126007	UNLIMITED-TRACK		1527329534	4.30486012	-37.846489
erick	0-3126007	UNLIMITED-TRACK		1527330730	4.29842997	-37.8688393
erick	0-3126007	UNLIMITED-TRACK		1527331327	4.30230999	-37.8780518
erick	0-3126007	UNLIMITED-TRACK		1527331946	4.30866003	-37.8852501
erick	0-3126007	UNLIMITED-TRACK		1527332529	4.31443977	-37.8859596
erick	0-3126007	UNLIMITED-TRACK		1527333129	4.32109022	-37.8853798
erick	0-3126007	UNLIMITED-TRACK		1527334330	4.3354001	-37.8827782
erick	0-3126007	UNLIMITED-TRACK		1527333730	4.32871008	-37.8846703
erick	0-3126007	UNLIMITED-TRACK		1527334931	4.34272003	-37.8814392
erick	0-3126007	UNLIMITED-TRACK		1527335547	4.34995985	-37.8794289
erick	0-3126007	UNLIMITED-TRACK		1527336719	4.36377001	-37.8747292
erick	0-3126007	UNLIMITED-TRACK		1527336119	4.35664988	-37.8771286
erick	0-3126007	UNLIMITED-TRACK		1527337920	4.37840986	-37.8700905
erick	0-3126007	UNLIMITED-TRACK		1527337320	4.37094021	-37.8720589
erick	0-3126007	UNLIMITED-TRACK		1527338519	4.3849802	-37.8679199
erick	0-3126007	UNLIMITED-TRACK		1527339146	4.39190006	-37.8665199
erick	0-3126007	UNLIMITED-TRACK		1527340323	4.40412998	-37.8657799
erick	0-3126007	UNLIMITED-TRACK		1527339723	4.39834023	-37.866291
erick	0-3126007	UNLIMITED-TRACK		1527341523	4.41602993	-37.8642883
erick	0-3126007	UNLIMITED-TRACK		1527342747	4.42737007	-37.8607788
erick	0-3126007	UNLIMITED-TRACK		1527342147	4.42145014	-37.8624992
erick	0-3126007	UNLIMITED-TRACK		1527343315	4.43283987	-37.8593102
erick	0-3126007	UNLIMITED-TRACK		1527344507	4.44295979	-37.8557396
erick	0-3126007	UNLIMITED-TRACK		1527343907	4.4382	-37.85746
erick	0-3126007	UNLIMITED-TRACK		1527345105	4.44815016	-37.854641
erick	0-3126007	UNLIMITED-TRACK		1527345700	4.45318985	-37.8527794
erick	0-3126007	UNLIMITED-TRACK		1527346893	4.46408987	-37.8497009
erick	0-3126007	UNLIMITED-TRACK		1527346293	4.4587698	-37.8511581
erick	0-3126007	UNLIMITED-TRACK		1527347489	4.46991014	-37.8481407
erick	0-3126007	UNLIMITED-TRACK		1527348087	4.47521019	-37.8462181
erick	0-3126007	UNLIMITED-TRACK		1527350475	4.50022984	-37.8379517
erick	0-3126007	UNLIMITED-TRACK		1527349875	4.49365997	-37.839489
erick	0-3126007	UNLIMITED-TRACK		1527349275	4.4865799	-37.8420601
erick	0-3126007	UNLIMITED-TRACK		1527351668	4.51521015	-37.8360901
erick	0-3126007	UNLIMITED-TRACK		1527351068	4.50756979	-37.8369484
erick	0-3126007	UNLIMITED-TRACK		1527352265	4.5227499	-37.8348694
erick	0-3126007	UNLIMITED-TRACK		1527352858	4.53058004	-37.8331299
erick	0-3126007	UNLIMITED-TRACK		1527353488	4.5387702	-37.8320312
erick	0-3126007	UNLIMITED-TRACK		1527354060	4.54617977	-37.8308716
erick	0-3126007	UNLIMITED-TRACK		1527354656	4.5535202	-37.829319
erick	0-3126007	UNLIMITED-TRACK		1527355252	4.56067991	-37.8282204
erick	0-3126007	UNLIMITED-TRACK		1527355856	4.56837988	-37.8274498
erick	0-3126007	UNLIMITED-TRACK		1527356446	4.57573986	-37.825779
erick	0-3126007	UNLIMITED-TRACK		1527357066	4.58361006	-37.8246803
erick	0-3126007	UNLIMITED-TRACK		1527357642	4.59054995	-37.8239098
erick	0-3126007	UNLIMITED-TRACK		1527358240	4.59841013	-37.8231201
erick	0-3126007	UNLIMITED-TRACK		1527359437	4.61388016	-37.8215599
erick	0-3126007	UNLIMITED-TRACK		1527358837	4.60607004	-37.8220711
erick	0-3126007	UNLIMITED-TRACK		1527360036	4.62131023	-37.8203392
erick	0-3126007	UNLIMITED-TRACK		1527360656	4.62868977	-37.8190613
erick	0-3126007	UNLIMITED-TRACK		1527361829	4.64082003	-37.8152199
erick	0-3126007	UNLIMITED-TRACK		1527361229	4.6349802	-37.8176193
erick	0-3126007	UNLIMITED-TRACK		1527362422	4.64050007	-37.8184814
erick	0-3126007	UNLIMITED-TRACK		1527363023	4.63816023	-37.8232117
erick	0-3126007	UNLIMITED-TRACK		1527363621	4.63162994	-37.8313904
erick	0-3126007	UNLIMITED-TRACK		1527364255	4.62521982	-37.8403282
erick	0-3126007	UNLIMITED-TRACK		1527364823	4.61926985	-37.8476601
erick	0-3126007	UNLIMITED-TRACK		1527365419	4.61798	-37.8511391
erick	0-3126007	UNLIMITED-TRACK		1527366021	4.61699009	-37.8539696
erick	0-3126007	UNLIMITED-TRACK		1527367219	4.61470985	-37.8589783
erick	0-3126007	UNLIMITED-TRACK		1527366619	4.61577988	-37.8565788
erick	0-3126007	UNLIMITED-TRACK		1527367856	4.61964989	-37.8576393
erick	0-3126007	UNLIMITED-TRACK		1527368413	4.6259799	-37.855011
erick	0-3126007	UNLIMITED-TRACK		1527369012	4.63242006	-37.8519897
erick	0-3126007	UNLIMITED-TRACK		1527369609	4.63935995	-37.8497314
erick	0-3126007	UNLIMITED-TRACK		1527370209	4.64655018	-37.84692
erick	0-3126007	UNLIMITED-TRACK		1527370806	4.65331984	-37.8440895
erick	0-3126007	UNLIMITED-TRACK		1527371426	4.66035986	-37.8413696
erick	0-3126007	UNLIMITED-TRACK		1527372008	4.66667986	-37.8389015
erick	0-3126007	UNLIMITED-TRACK		1527372611	4.67403984	-37.8372192
erick	0-3126007	UNLIMITED-TRACK		1527373805	4.68770981	-37.8328896
erick	0-3126007	UNLIMITED-TRACK		1527373205	4.68089008	-37.8347816
erick	0-3126007	UNLIMITED-TRACK		1527374405	4.69462013	-37.8305397
erick	0-3126007	UNLIMITED-TRACK		1527375023	4.7016902	-37.8281593
erick	0-3126007	UNLIMITED-TRACK		1527375601	4.70755005	-37.8244286
erick	0-3126007	UNLIMITED-TRACK		1527376199	4.71427011	-37.8222389
erick	0-3126007	UNLIMITED-TRACK		1527376797	4.72014999	-37.8200111
erick	0-3126007	UNLIMITED-TRACK		1527377393	4.72575998	-37.8184814
erick	0-3126007	UNLIMITED-TRACK		1527377991	4.73188019	-37.8163795
erick	0-3126007	UNLIMITED-TRACK		1527379195	4.74513006	-37.8132286
erick	0-3126007	UNLIMITED-TRACK		1527378595	4.73916006	-37.8142586
erick	0-3126007	UNLIMITED-TRACK		1527379791	4.75122976	-37.8118591
erick	0-3126007	UNLIMITED-TRACK		1527380386	4.75721979	-37.8107605
erick	0-3126007	UNLIMITED-TRACK		1527380985	4.76379013	-37.8096619
erick	0-3126007	UNLIMITED-TRACK		1527381581	4.77066994	-37.8082619
erick	0-3126007	UNLIMITED-TRACK		1527382196	4.77694988	-37.8069801
erick	0-3126007	UNLIMITED-TRACK		1527382779	4.78234005	-37.8048706
erick	0-3126007	UNLIMITED-TRACK		1527383379	4.78809023	-37.8033104
erick	0-3126007	UNLIMITED-TRACK		1527384572	4.79957008	-37.7998695
erick	0-3126007	UNLIMITED-TRACK		1527383972	4.79399014	-37.80159
erick	0-3126007	UNLIMITED-TRACK		1527385168	4.80525017	-37.797821
erick	0-3126007	UNLIMITED-TRACK		1527385795	4.81050014	-37.79599
erick	0-3126007	UNLIMITED-TRACK		1527386365	4.81549978	-37.7940407
erick	0-3126007	UNLIMITED-TRACK		1527387564	4.82581997	-37.7904701
erick	0-3126007	UNLIMITED-TRACK		1527386964	4.82019997	-37.7920113
erick	0-3126007	UNLIMITED-TRACK		1527388163	4.83136988	-37.7893715
erick	0-3126007	UNLIMITED-TRACK		1527388760	4.83495998	-37.7884789
erick	0-3126007	UNLIMITED-TRACK		1527389394	4.83867979	-37.7876587
erick	0-3126007	UNLIMITED-TRACK		1527389959	4.84222984	-37.7867088
erick	0-3126007	UNLIMITED-TRACK		1527390559	4.84694004	-37.78619
erick	0-3126007	UNLIMITED-TRACK		1527391157	4.85141993	-37.784729
erick	0-3126007	UNLIMITED-TRACK		1527391757	4.85664988	-37.7845497
erick	0-3126007	UNLIMITED-TRACK		1527392353	4.86268997	-37.7828102
erick	0-3126007	UNLIMITED-TRACK		1527392976	4.86911011	-37.7820396
erick	0-3126007	UNLIMITED-TRACK		1527394146	4.88155985	-37.7800598
erick	0-3126007	UNLIMITED-TRACK		1527393546	4.87512016	-37.7810898
erick	0-3126007	UNLIMITED-TRACK		1527394748	4.88721991	-37.7786903
erick	0-3126007	UNLIMITED-TRACK		1527395946	4.89857006	-37.7769203
erick	0-3126007	UNLIMITED-TRACK		1527395346	4.89281988	-37.7777786
erick	0-3126007	UNLIMITED-TRACK		1527396566	4.90410995	-37.7758789
erick	0-3126007	UNLIMITED-TRACK		1527397149	4.91028023	-37.7745094
erick	0-3126007	UNLIMITED-TRACK		1527397747	4.91650009	-37.7732506
erick	0-3126007	UNLIMITED-TRACK		1527398346	4.92179012	-37.7710915
erick	0-3126007	UNLIMITED-TRACK		1527398942	4.92894983	-37.7695007
erick	0-3126007	UNLIMITED-TRACK		1527399541	4.93649006	-37.7675514
erick	0-3126007	UNLIMITED-TRACK		1527400166	4.9444499	-37.7703209
erick	0-3126007	UNLIMITED-TRACK		1527400735	4.94737005	-37.7810402
erick	0-3126007	UNLIMITED-TRACK		1527401333	4.95090008	-37.7913513
erick	0-3126007	UNLIMITED-TRACK		1527401929	4.95402002	-37.8021202
erick	0-3126007	UNLIMITED-TRACK		1527402528	4.95716	-37.812561
erick	0-3126007	UNLIMITED-TRACK		1527403124	4.9594202	-37.8229408
erick	0-3126007	UNLIMITED-TRACK		1527403747	4.96151018	-37.8343811
erick	0-3126007	UNLIMITED-TRACK		1527404320	4.9637599	-37.8443298
erick	0-3126007	UNLIMITED-TRACK		1527404921	4.96585989	-37.8548584
erick	0-3126007	UNLIMITED-TRACK		1527405518	4.96849012	-37.8658104
erick	0-3126007	UNLIMITED-TRACK		1527406118	4.97052002	-37.87677
erick	0-3126007	UNLIMITED-TRACK		1527406715	4.97375011	-37.8866615
erick	0-3126007	UNLIMITED-TRACK		1527407337	4.97397995	-37.8918495
erick	0-3126007	UNLIMITED-TRACK		1527407909	4.97350979	-37.8952599
erick	0-3126007	UNLIMITED-TRACK		1527408508	4.97243023	-37.8985901
erick	0-3126007	UNLIMITED-TRACK		1527409104	4.97177982	-37.9016418
erick	0-3126007	UNLIMITED-TRACK		1527409703	4.97157001	-37.9045105
erick	0-3126007	UNLIMITED-TRACK		1527410300	4.9706502	-37.9075317
erick	0-3126007	UNLIMITED-TRACK		1527410935	4.97017002	-37.909729
erick	0-3126007	UNLIMITED-TRACK		1527412093	4.96905994	-37.9138489
erick	0-3126007	UNLIMITED-TRACK		1527411493	4.96983004	-37.9121284
erick	0-3126007	UNLIMITED-TRACK		1527413287	4.96695995	-37.9191017
erick	0-3126007	UNLIMITED-TRACK		1527412687	4.96808004	-37.9166107
erick	0-3126007	UNLIMITED-TRACK		1527413882	4.96454	-37.9239807
erick	0-3126007	UNLIMITED-TRACK		1527414073	4.9622798	-37.9265709
erick	0-3126007	UNLIMITED-TRACK		1527414506	4.95763016	-37.9321289
erick	0-3126007	UNLIMITED-TRACK		1527415081	4.95193005	-37.939579
erick	0-3126007	UNLIMITED-TRACK		1527415678	4.94762993	-37.948761
erick	0-3126007	UNLIMITED-TRACK		1527416274	4.94428015	-37.9585609
erick	0-3126007	UNLIMITED-TRACK		1527416873	4.94303989	-37.9639282
erick	0-3126007	UNLIMITED-TRACK		1527418671	4.95550013	-37.9601707
erick	0-3126007	UNLIMITED-TRACK		1527418071	4.94988012	-37.9628296
erick	0-3126007	UNLIMITED-TRACK		1527417471	4.94412994	-37.9654884
erick	0-3126007	UNLIMITED-TRACK		1527419270	4.96096992	-37.9573708
erick	0-3126007	UNLIMITED-TRACK		1527419864	4.96639013	-37.9544716
erick	0-3126007	UNLIMITED-TRACK		1527421064	4.97766018	-37.9488792
erick	0-3126007	UNLIMITED-TRACK		1527420464	4.97234011	-37.9517097
erick	0-3126007	UNLIMITED-TRACK		1527421685	4.98315001	-37.9462891
erick	0-3126007	UNLIMITED-TRACK		1527422262	4.98864985	-37.9439392
erick	0-3126007	UNLIMITED-TRACK		1527423456	4.99907017	-37.9383888
erick	0-3126007	UNLIMITED-TRACK		1527422856	4.9935298	-37.9412193
erick	0-3126007	UNLIMITED-TRACK		1527424053	5.00467014	-37.9354591
erick	0-3126007	UNLIMITED-TRACK		1527424652	5.00980997	-37.9331703
erick	0-3126007	UNLIMITED-TRACK		1527425850	5.01955986	-37.9280396
erick	0-3126007	UNLIMITED-TRACK		1527425250	5.01461983	-37.9308701
erick	0-3126007	UNLIMITED-TRACK		1527426446	5.02490997	-37.9246216
erick	0-3126007	UNLIMITED-TRACK		1527427047	5.03057003	-37.9208107
erick	0-3126007	UNLIMITED-TRACK		1527427647	5.03625011	-37.9173317
erick	0-3126007	UNLIMITED-TRACK		1527428244	5.04197979	-37.9140015
erick	0-3126007	UNLIMITED-TRACK		1527428875	5.04898024	-37.9103394
erick	0-3126007	UNLIMITED-TRACK		1527429443	5.05575991	-37.90765
erick	0-3126007	UNLIMITED-TRACK		1527430044	5.06166983	-37.9039917
erick	0-3126007	UNLIMITED-TRACK		1527431232	5.07537985	-37.8972397
erick	0-3126007	UNLIMITED-TRACK		1527430632	5.06821012	-37.9002419
erick	0-3126007	UNLIMITED-TRACK		1527431832	5.08198977	-37.8939781
erick	0-3126007	UNLIMITED-TRACK		1527432449	5.08871984	-37.8903809
erick	0-3126007	UNLIMITED-TRACK		1527433626	5.10086012	-37.8823891
erick	0-3126007	UNLIMITED-TRACK		1527433026	5.09510994	-37.8863411
erick	0-3126007	UNLIMITED-TRACK		1527434827	5.10075998	-37.8842201
erick	0-3126007	UNLIMITED-TRACK		1527434227	5.10501003	-37.8805313
erick	0-3126007	UNLIMITED-TRACK		1527436047	5.10905981	-37.8808899
erick	0-3126007	UNLIMITED-TRACK		1527437211	5.12220001	-37.8754005
erick	0-3126007	UNLIMITED-TRACK		1527436611	5.11511993	-37.8779716
erick	0-3126007	UNLIMITED-TRACK		1527438401	5.13103008	-37.8761902
erick	0-3126007	UNLIMITED-TRACK		1527437801	5.12952995	-37.8728409
erick	0-3126007	UNLIMITED-TRACK		1527439000	5.13042021	-37.8810997
erick	0-3126007	UNLIMITED-TRACK		1527439617	5.13676023	-37.8788109
erick	0-3126007	UNLIMITED-TRACK		1527440207	5.14352989	-37.8761902
erick	0-3126007	UNLIMITED-TRACK		1527440792	5.15115976	-37.87286
erick	0-3126007	UNLIMITED-TRACK		1527441392	5.15755987	-37.8695412
erick	0-3126007	UNLIMITED-TRACK		1527441989	5.16401005	-37.8659401
erick	0-3126007	UNLIMITED-TRACK		1527442589	5.17116022	-37.8629189
erick	0-3126007	UNLIMITED-TRACK		1527443783	5.18604994	-37.8577614
erick	0-3126007	UNLIMITED-TRACK		1527443183	5.17914009	-37.8603287
erick	0-3126007	UNLIMITED-TRACK		1527444373	5.19321012	-37.8548012
erick	0-3126007	UNLIMITED-TRACK		1527444971	5.20016003	-37.851841
erick	0-3126007	UNLIMITED-TRACK		1527446166	5.21504021	-37.8453102
erick	0-3126007	UNLIMITED-TRACK		1527445566	5.20727015	-37.8485718
erick	0-3126007	UNLIMITED-TRACK		1527448555	5.24836016	-37.8332481
erick	0-3126007	UNLIMITED-TRACK		1527449148	5.25740004	-37.830719
erick	0-3126007	UNLIMITED-TRACK		1527447948	5.23998022	-37.8359604
erick	0-3126007	UNLIMITED-TRACK		1527449749	5.2624402	-37.8309593
erick	0-3126007	UNLIMITED-TRACK		1527450385	5.26234007	-37.8341408
erick	0-3126007	UNLIMITED-TRACK		1527450951	5.26257992	-37.837101
erick	0-3126007	UNLIMITED-TRACK		1527451549	5.25946999	-37.8437195
erick	0-3126007	UNLIMITED-TRACK		1527452144	5.25379992	-37.8512001
erick	0-3126007	UNLIMITED-TRACK		1527453337	5.25096989	-37.8628197
erick	0-3126007	UNLIMITED-TRACK		1527452737	5.25053978	-37.8599892
erick	0-3126007	UNLIMITED-TRACK		1527453958	5.25082016	-37.8663902
erick	0-3126007	UNLIMITED-TRACK		1527455126	5.2507	-37.8725014
erick	0-3126007	UNLIMITED-TRACK		1527454526	5.25074005	-37.8694115
erick	0-3126007	UNLIMITED-TRACK		1527455721	5.25106001	-37.8751183
erick	0-3126007	UNLIMITED-TRACK		1527456319	5.25128984	-37.8777809
erick	0-3126007	UNLIMITED-TRACK		1527457537	5.25375986	-37.8895912
erick	0-3126007	UNLIMITED-TRACK		1527456937	5.25217009	-37.8810081
erick	0-3126007	UNLIMITED-TRACK		1527459304	5.26846981	-37.8982506
erick	0-3126007	UNLIMITED-TRACK		1527459901	5.27264023	-37.8939514
erick	0-3126007	UNLIMITED-TRACK		1527458701	5.26449013	-37.9030495
erick	0-3126007	UNLIMITED-TRACK		1527458109	5.25889015	-37.8985291
erick	0-3126007	UNLIMITED-TRACK		1527458707	5.26448011	-37.9031105
erick	0-3126007	UNLIMITED-TRACK		1527460501	5.27747011	-37.8903809
erick	0-3126007	UNLIMITED-TRACK		1527459901	5.27265978	-37.8939018
erick	0-3126007	UNLIMITED-TRACK		1527459301	5.26849985	-37.8981895
erick	0-3126007	UNLIMITED-TRACK		1527461126	5.28407001	-37.8876991
erick	0-3126007	UNLIMITED-TRACK		1527461695	5.28984022	-37.8851013
erick	0-3126007	UNLIMITED-TRACK		1527462293	5.29601002	-37.8823891
erick	0-3126007	UNLIMITED-TRACK		1527462891	5.30177021	-37.8789711
erick	0-3126007	UNLIMITED-TRACK		1527463487	5.30721998	-37.8758507
erick	0-3126007	UNLIMITED-TRACK		1527464083	5.31272984	-37.8728294
erick	0-3126007	UNLIMITED-TRACK		1527464706	5.31888008	-37.8698997
erick	0-3126007	UNLIMITED-TRACK		1527465278	5.32452011	-37.8670006
erick	0-3126007	UNLIMITED-TRACK		1527465876	5.32974005	-37.8639183
erick	0-3126007	UNLIMITED-TRACK		1527466474	5.33536005	-37.8607788
erick	0-3126007	UNLIMITED-TRACK		1527467071	5.34083986	-37.8582191
erick	0-3126007	UNLIMITED-TRACK		1527468296	5.35195017	-37.8519592
erick	0-3126007	UNLIMITED-TRACK		1527467696	5.34606981	-37.8557396
erick	0-3126007	UNLIMITED-TRACK		1527468865	5.35765982	-37.8494606
erick	0-3126007	UNLIMITED-TRACK		1527469465	5.36352015	-37.846981
erick	0-3126007	UNLIMITED-TRACK		1527470060	5.36960983	-37.8447304
erick	0-3126007	UNLIMITED-TRACK		1527470659	5.37552977	-37.8419495
erick	0-3126007	UNLIMITED-TRACK		1527471255	5.38106012	-37.8387489
erick	0-3126007	UNLIMITED-TRACK		1527471878	5.38709021	-37.8348083
erick	0-3126007	UNLIMITED-TRACK		1527472450	5.3920002	-37.8315392
erick	0-3126007	UNLIMITED-TRACK		1527473644	5.40357018	-37.8252602
erick	0-3126007	UNLIMITED-TRACK		1527473044	5.39752007	-37.8280106
erick	0-3126007	UNLIMITED-TRACK		1527474243	5.40979004	-37.8218117
erick	0-3126007	UNLIMITED-TRACK		1527474839	5.41498995	-37.8185081
erick	0-3126007	UNLIMITED-TRACK		1527475464	5.42028999	-37.8160706
erick	0-3126007	UNLIMITED-TRACK		1527477229	5.43682003	-37.8107605
erick	0-3126007	UNLIMITED-TRACK		1527476629	5.4314599	-37.8124809
erick	0-3126007	UNLIMITED-TRACK		1527476029	5.4258399	-37.8148003
erick	0-3126007	UNLIMITED-TRACK		1527478423	5.44660997	-37.8084717
erick	0-3126007	UNLIMITED-TRACK		1527477823	5.44150019	-37.80933
erick	0-3126007	UNLIMITED-TRACK		1527479047	5.45143986	-37.8054199
erick	0-3126007	UNLIMITED-TRACK		1527479620	5.4558301	-37.8017883
erick	0-3126007	UNLIMITED-TRACK		1527480217	5.4608798	-37.798069
erick	0-3126007	UNLIMITED-TRACK		1527480817	5.46472979	-37.7964783
erick	0-3126007	UNLIMITED-TRACK		1527481415	5.4635601	-37.79916
erick	0-3126007	UNLIMITED-TRACK		1527482018	5.46267986	-37.8013
erick	0-3126007	UNLIMITED-TRACK		1527482637	5.46184015	-37.8037682
erick	0-3126007	UNLIMITED-TRACK		1527483233	5.46116018	-37.8056602
erick	0-3126007	UNLIMITED-TRACK		1527483835	5.46017981	-37.8081703
erick	0-3126007	UNLIMITED-TRACK		1527485005	5.45776987	-37.8119507
erick	0-3126007	UNLIMITED-TRACK		1527484405	5.45893002	-37.8105812
erick	0-3126007	UNLIMITED-TRACK		1527486237	5.45552015	-37.8204689
erick	0-3126007	UNLIMITED-TRACK		1527485637	5.45637989	-37.8137817
erick	0-3126007	UNLIMITED-TRACK		1527486797	5.45770979	-37.8294411
erick	0-3126007	UNLIMITED-TRACK		1527487392	5.46048021	-37.8387489
erick	0-3126007	UNLIMITED-TRACK		1527488585	5.46132994	-37.8498192
erick	0-3126007	UNLIMITED-TRACK		1527487985	5.46112013	-37.8432999
erick	0-3126007	UNLIMITED-TRACK		1527489187	5.46331978	-37.8599205
erick	0-3126007	UNLIMITED-TRACK		1527490385	5.46670008	-37.8798485
erick	0-3126007	UNLIMITED-TRACK		1527489785	5.46503019	-37.8706703
erick	0-3126007	UNLIMITED-TRACK		1527490985	5.46920013	-37.8896484
erick	0-3126007	UNLIMITED-TRACK		1527491582	5.47127008	-37.8997498
erick	0-3126007	UNLIMITED-TRACK		1527492183	5.47376013	-37.9095802
erick	0-3126007	UNLIMITED-TRACK		1527492778	5.47501993	-37.9193115
erick	0-3126007	UNLIMITED-TRACK		1527493410	5.4767499	-37.9296913
erick	0-3126007	UNLIMITED-TRACK		1527493973	5.47783995	-37.9377403
erick	0-3126007	UNLIMITED-TRACK		1527494572	5.47688007	-37.9440002
erick	0-3126007	UNLIMITED-TRACK		1527495167	5.47721004	-37.9541588
erick	0-3126007	UNLIMITED-TRACK		1527495767	5.47677994	-37.9644508
erick	0-3126007	UNLIMITED-TRACK		1527496368	5.47387981	-37.9748192
erick	0-3126007	UNLIMITED-TRACK		1527497559	5.46511984	-37.9930687
erick	0-3126007	UNLIMITED-TRACK		1527496959	5.46915007	-37.9845695
erick	0-3126007	UNLIMITED-TRACK		1527498158	5.46341991	-37.9950905
erick	0-3126007	UNLIMITED-TRACK		1527498764	5.46168995	-37.9973793
erick	0-3126007	UNLIMITED-TRACK		1527499959	5.45812988	-38.0016518
erick	0-3126007	UNLIMITED-TRACK		1527499359	5.45979977	-37.9995003
erick	0-3126007	UNLIMITED-TRACK		1527500485	5.45679998	-38.0034218
erick	0-3126007	UNLIMITED-TRACK		1527501147	5.45526981	-38.0044899
erick	0-3126007	UNLIMITED-TRACK		1527501757	5.45385981	-38.0060692
erick	0-3126007	UNLIMITED-TRACK		1527502343	5.45375013	-38.0062904
erick	0-3126007	UNLIMITED-TRACK		1527502943	5.45620012	-38.0016785
erick	0-3126007	UNLIMITED-TRACK		1527503539	5.45986986	-37.9976196
erick	0-3126007	UNLIMITED-TRACK		1527504187	5.46458006	-37.9941101
erick	0-3126007	UNLIMITED-TRACK		1527505335	5.47399998	-37.9865685
erick	0-3126007	UNLIMITED-TRACK		1527504735	5.46905994	-37.9904289
erick	0-3126007	UNLIMITED-TRACK		1527505932	5.47972012	-37.9822388
erick	0-3126007	UNLIMITED-TRACK		1527506544	5.48475981	-37.9774818
erick	0-3126007	UNLIMITED-TRACK		1527507750	5.49614	-37.9685097
erick	0-3126007	UNLIMITED-TRACK		1527507150	5.49030018	-37.9729691
erick	0-3126007	UNLIMITED-TRACK		1527508942	5.50605011	-37.9601707
erick	0-3126007	UNLIMITED-TRACK		1527508342	5.5013299	-37.9644585
erick	0-3126007	UNLIMITED-TRACK		1527509521	5.51032019	-37.9553185
erick	0-3126007	UNLIMITED-TRACK		1527510120	5.51433992	-37.9517784
erick	0-3126007	UNLIMITED-TRACK		1527510718	5.51973009	-37.9477806
erick	0-3126007	UNLIMITED-TRACK		1527511347	5.52589989	-37.9444008
erick	0-3126007	UNLIMITED-TRACK		1527513116	5.54028988	-37.9328003
erick	0-3126007	UNLIMITED-TRACK		1527513713	5.5441699	-37.9291115
erick	0-3126007	UNLIMITED-TRACK		1527512513	5.53571987	-37.9370117
erick	0-3126007	UNLIMITED-TRACK		1527514306	5.54834986	-37.9254799
erick	0-3126007	UNLIMITED-TRACK		1527515503	5.55483007	-37.9190712
erick	0-3126007	UNLIMITED-TRACK		1527514903	5.55194998	-37.9220695
erick	0-3126007	UNLIMITED-TRACK		1527516099	5.55840015	-37.9156799
erick	0-3126007	UNLIMITED-TRACK		1527516697	5.56286001	-37.9122887
erick	0-3126007	UNLIMITED-TRACK		1527517293	5.56732988	-37.9088097
erick	0-3126007	UNLIMITED-TRACK		1527517891	5.57242012	-37.9042397
erick	0-3126007	UNLIMITED-TRACK		1527518514	5.57692003	-37.8997498
erick	0-3126007	UNLIMITED-TRACK		1527519086	5.58012009	-37.8939209
erick	0-3126007	UNLIMITED-TRACK		1527520883	5.59602022	-37.8803711
erick	0-3126007	UNLIMITED-TRACK		1527520283	5.59082985	-37.8846588
erick	0-3126007	UNLIMITED-TRACK		1527519683	5.58421993	-37.8882599
erick	0-3126007	UNLIMITED-TRACK		1527521482	5.60199022	-37.8754883
erick	0-3126007	UNLIMITED-TRACK		1527522674	5.61532021	-37.8669395
erick	0-3126007	UNLIMITED-TRACK		1527522074	5.60901022	-37.8710594
erick	0-3126007	UNLIMITED-TRACK		1527523274	5.62111998	-37.8626404
erick	0-3126007	UNLIMITED-TRACK		1527523871	5.62542009	-37.8579712
erick	0-3126007	UNLIMITED-TRACK		1527525067	5.63628006	-37.8497581
erick	0-3126007	UNLIMITED-TRACK		1527524467	5.63129997	-37.8547401
erick	0-3126007	UNLIMITED-TRACK		1527525685	5.64213991	-37.8450012
erick	0-3126007	UNLIMITED-TRACK		1527526263	5.64754009	-37.8406715
erick	0-3126007	UNLIMITED-TRACK		1527526862	5.65181017	-37.8362694
erick	0-3126007	UNLIMITED-TRACK		1527527457	5.6557498	-37.8318214
erick	0-3126007	UNLIMITED-TRACK		1527528055	5.65993977	-37.8275795
erick	0-3126007	UNLIMITED-TRACK		1527528652	5.6647501	-37.822361
erick	0-3126007	UNLIMITED-TRACK		1527529284	5.66972017	-37.8168602
erick	0-3126007	UNLIMITED-TRACK		1527529847	5.67469978	-37.8119507
erick	0-3126007	UNLIMITED-TRACK		1527530441	5.67972994	-37.8065796
erick	0-3126007	UNLIMITED-TRACK		1527531038	5.68482018	-37.801609
erick	0-3126007	UNLIMITED-TRACK		1527532234	5.69555998	-37.7920189
erick	0-3126007	UNLIMITED-TRACK		1527531634	5.69061995	-37.7965698
erick	0-3126007	UNLIMITED-TRACK		1527534036	5.70901012	-37.777771
erick	0-3126007	UNLIMITED-TRACK		1527533436	5.70565987	-37.7827492
erick	0-3126007	UNLIMITED-TRACK		1527532836	5.70098019	-37.786869
erick	0-3126007	UNLIMITED-TRACK		1527534630	5.71306992	-37.7728615
erick	0-3126007	UNLIMITED-TRACK		1527535822	5.72538996	-37.7642784
erick	0-3126007	UNLIMITED-TRACK		1527535222	5.71834993	-37.7680588
erick	0-3126007	UNLIMITED-TRACK		1527536455	5.7248702	-37.7659912
erick	0-3126007	UNLIMITED-TRACK		1527537019	5.72385979	-37.7683983
erick	0-3126007	UNLIMITED-TRACK		1527537619	5.72299004	-37.7704811
erick	0-3126007	UNLIMITED-TRACK		1527538215	5.71985006	-37.7772217
erick	0-3126007	UNLIMITED-TRACK		1527538814	5.71705008	-37.7860413
erick	0-3126007	UNLIMITED-TRACK		1527540027	5.71073008	-37.7994385
erick	0-3126007	UNLIMITED-TRACK		1527539427	5.71288013	-37.7948914
erick	0-3126007	UNLIMITED-TRACK		1527541203	5.70803022	-37.8032188
erick	0-3126007	UNLIMITED-TRACK		1527540603	5.70936012	-37.8014984
erick	0-3126007	UNLIMITED-TRACK		1527541800	5.7063098	-37.8055687
erick	0-3126007	UNLIMITED-TRACK		1527543626	5.70820999	-37.8235817
erick	0-3126007	UNLIMITED-TRACK		1527543026	5.70571995	-37.8153381
erick	0-3126007	UNLIMITED-TRACK		1527542426	5.70508003	-37.8077011
erick	0-3126007	UNLIMITED-TRACK		1527540604	5.70938015	-37.8014793
erick	0-3126007	UNLIMITED-TRACK		1527542441	5.70502996	-37.8076515
erick	0-3126007	UNLIMITED-TRACK		1527546011	5.72446012	-37.8122292
erick	0-3126007	UNLIMITED-TRACK		1527545411	5.71888018	-37.8178101
erick	0-3126007	UNLIMITED-TRACK		1527544811	5.71575022	-37.8237305
erick	0-3126007	UNLIMITED-TRACK		1527548424	5.74773979	-37.7893982
erick	0-3126007	UNLIMITED-TRACK	The SPOT Trace battery is low and needs to be replaced.	1527549012	5.75325012	-37.7847595
erick	0-3126007	UNLIMITED-TRACK		1527547812	5.7405901	-37.7946281
erick	0-3126007	UNLIMITED-TRACK		1527550210	5.76428986	-37.7752686
erick	0-3126007	UNLIMITED-TRACK		1527549610	5.7585001	-37.7798195
erick	0-3126007	UNLIMITED-TRACK		1527550825	5.7704401	-37.7699585
erick	0-3126007	UNLIMITED-TRACK		1527551415	5.7760601	-37.76511
erick	0-3126007	UNLIMITED-TRACK		1527552605	5.7867198	-37.7552795
erick	0-3126007	UNLIMITED-TRACK		1527552005	5.78177977	-37.7596588
erick	0-3126007	UNLIMITED-TRACK		1527553205	5.79046011	-37.7508202
erick	0-3126007	UNLIMITED-TRACK		1527553801	5.79426003	-37.7472191
erick	0-3126007	UNLIMITED-TRACK		1527554427	5.79773998	-37.7425194
erick	0-3126007	UNLIMITED-TRACK		1527554996	5.80064011	-37.7383995
erick	0-3126007	UNLIMITED-TRACK		1527555589	5.8028698	-37.7352905
erick	0-3126007	UNLIMITED-TRACK		1527556186	5.80514002	-37.7318115
erick	0-3126007	UNLIMITED-TRACK		1527556779	5.80788994	-37.7283287
erick	0-3126007	UNLIMITED-TRACK		1527557376	5.81025982	-37.7247009
erick	0-3126007	UNLIMITED-TRACK		1527558572	5.81606007	-37.7186012
erick	0-3126007	UNLIMITED-TRACK		1527557972	5.81339979	-37.7215195
erick	0-3126007	UNLIMITED-TRACK		1527559172	5.81936979	-37.7154808
erick	0-3126007	UNLIMITED-TRACK		1527559767	5.82175016	-37.7133484
erick	0-3126007	UNLIMITED-TRACK		1527561594	5.82847023	-37.7085915
erick	0-3126007	UNLIMITED-TRACK		1527560994	5.82693005	-37.7099609
erick	0-3126007	UNLIMITED-TRACK		1527560394	5.82430983	-37.7116814
erick	0-3126007	UNLIMITED-TRACK		1527562757	5.83304977	-37.7070007
erick	0-3126007	UNLIMITED-TRACK		1527562157	5.83082008	-37.7080307
erick	0-3126007	UNLIMITED-TRACK		1527563958	5.84078979	-37.7012901
erick	0-3126007	UNLIMITED-TRACK		1527563358	5.83616018	-37.7048111
erick	0-3126007	UNLIMITED-TRACK		1527560958	5.82691002	-37.7100182
erick	0-3126007	UNLIMITED-TRACK		1527565177	5.84928989	-37.6926003
erick	0-3126007	UNLIMITED-TRACK		1527563354	5.83613014	-37.7048302
erick	0-3126007	UNLIMITED-TRACK		1527566342	5.85792017	-37.6848106
erick	0-3126007	UNLIMITED-TRACK		1527566938	5.86302996	-37.6813011
erick	0-3126007	UNLIMITED-TRACK		1527565738	5.85393	-37.6887589
erick	0-3126007	UNLIMITED-TRACK		1527567533	5.86794996	-37.6772804
erick	0-3126007	UNLIMITED-TRACK		1527568134	5.86905003	-37.6766396
erick	0-3126007	UNLIMITED-TRACK		1527568765	5.86647987	-37.6793213
erick	0-3126007	UNLIMITED-TRACK		1527569324	5.86422014	-37.681881
erick	0-3126007	UNLIMITED-TRACK		1527570523	5.85942984	-37.6865196
erick	0-3126007	UNLIMITED-TRACK		1527569923	5.86166	-37.6841202
erick	0-3126007	UNLIMITED-TRACK		1527571709	5.85438013	-37.6917114
erick	0-3126007	UNLIMITED-TRACK		1527571109	5.85687017	-37.6888809
erick	0-3126007	UNLIMITED-TRACK		1527572336	5.85166979	-37.6942711
erick	0-3126007	UNLIMITED-TRACK		1527572907	5.85130978	-37.7002602
erick	0-3126007	UNLIMITED-TRACK		1527573504	5.85258007	-37.7100487
erick	0-3126007	UNLIMITED-TRACK		1527574098	5.85433006	-37.7200012
erick	0-3126007	UNLIMITED-TRACK		1527574695	5.85656977	-37.72995
erick	0-3126007	UNLIMITED-TRACK		1527575288	5.85761023	-37.7397499
erick	0-3126007	UNLIMITED-TRACK		1527575908	5.85963011	-37.7505188
erick	0-3126007	UNLIMITED-TRACK		1527576478	5.86116982	-37.7602501
erick	0-3126007	UNLIMITED-TRACK		1527577075	5.8633399	-37.7694397
erick	0-3126007	UNLIMITED-TRACK		1527577672	5.86484003	-37.7787819
erick	0-3126007	UNLIMITED-TRACK		1527578276	5.86698008	-37.7879295
erick	0-3126007	UNLIMITED-TRACK		1527579503	5.86195993	-37.8021202
erick	0-3126007	UNLIMITED-TRACK		1527578903	5.8641901	-37.7969704
erick	0-3126007	UNLIMITED-TRACK		1527580668	5.85746002	-37.8070984
erick	0-3126007	UNLIMITED-TRACK		1527580068	5.86015987	-37.8044395
erick	0-3126007	UNLIMITED-TRACK		1527581862	5.85301018	-37.812191
erick	0-3126007	UNLIMITED-TRACK		1527581262	5.85519981	-37.8098717
erick	0-3126007	UNLIMITED-TRACK		1527583077	5.84974003	-37.8172607
erick	0-3126007	UNLIMITED-TRACK		1527582477	5.8513298	-37.8146019
erick	0-3126007	UNLIMITED-TRACK		1527584250	5.84619999	-37.8229713
erick	0-3126007	UNLIMITED-TRACK		1527583650	5.84796	-37.8202209
erick	0-3126007	UNLIMITED-TRACK		1527584850	5.84453011	-37.82584
erick	0-3126007	UNLIMITED-TRACK		1527585450	5.84239006	-37.828701
erick	0-3126007	UNLIMITED-TRACK		1527586045	5.84080982	-37.8313599
erick	0-3126007	UNLIMITED-TRACK		1527586676	5.83874989	-37.8344383
erick	0-3126007	UNLIMITED-TRACK		1527586842	5.83814001	-37.8352089
erick	0-3126007	UNLIMITED-TRACK		1527587238	5.83636999	-37.8371582
erick	0-3126007	UNLIMITED-TRACK		1527587838	5.83191013	-37.8470497
erick	0-3126007	UNLIMITED-TRACK		1527588437	5.82730007	-37.8573303
erick	0-3126007	UNLIMITED-TRACK		1527589633	5.81607008	-37.8777504
erick	0-3126007	UNLIMITED-TRACK		1527589033	5.82212019	-37.8681412
erick	0-3126007	UNLIMITED-TRACK		1527590825	5.81168985	-37.883419
erick	0-3126007	UNLIMITED-TRACK		1527590225	5.81401014	-37.8807602
erick	0-3126007	UNLIMITED-TRACK		1527592022	5.81020021	-37.8830299
erick	0-3126007	UNLIMITED-TRACK		1527591422	5.80938005	-37.8857803
erick	0-3126007	UNLIMITED-TRACK		1527593215	5.81539011	-37.8738098
erick	0-3126007	UNLIMITED-TRACK		1527592615	5.81315994	-37.8784409
erick	0-3126007	UNLIMITED-TRACK		1527593846	5.81818008	-37.8681602
erick	0-3126007	UNLIMITED-TRACK		1527594413	5.82061005	-37.8631897
erick	0-3126007	UNLIMITED-TRACK		1527595607	5.82610989	-37.8530617
erick	0-3126007	UNLIMITED-TRACK		1527595007	5.82370996	-37.8583794
erick	0-3126007	UNLIMITED-TRACK		1527597428	5.83407021	-37.8379211
erick	0-3126007	UNLIMITED-TRACK		1527598000	5.83697987	-37.8338318
erick	0-3126007	UNLIMITED-TRACK		1527596800	5.83109999	-37.8426704
erick	0-3126007	UNLIMITED-TRACK		1527598596	5.84005022	-37.8291283
erick	0-3126007	UNLIMITED-TRACK		1527599194	5.84282017	-37.8245506
erick	0-3126007	UNLIMITED-TRACK		1527599790	5.84589005	-37.8202209
erick	0-3126007	UNLIMITED-TRACK		1527600390	5.84922981	-37.8161011
erick	0-3126007	UNLIMITED-TRACK		1527601017	5.85231018	-37.8113098
erick	0-3126007	UNLIMITED-TRACK		1527601580	5.85503006	-37.8069496
erick	0-3126007	UNLIMITED-TRACK		1527602776	5.86078978	-37.799221
erick	0-3126007	UNLIMITED-TRACK		1527603375	5.86423016	-37.7950401
erick	0-3126007	UNLIMITED-TRACK		1527602175	5.85758018	-37.8033714
erick	0-3126007	UNLIMITED-TRACK		1527603975	5.86676979	-37.7901611
erick	0-3126007	UNLIMITED-TRACK		1527604595	5.86960983	-37.7843285
erick	0-3126007	UNLIMITED-TRACK		1527605170	5.87262011	-37.7790489
erick	0-3126007	UNLIMITED-TRACK		1527605769	5.87540007	-37.7739296
erick	0-3126007	UNLIMITED-TRACK		1527606368	5.88271999	-37.7717285
erick	0-3126007	UNLIMITED-TRACK		1527606970	5.88992977	-37.7701416
erick	0-3126007	UNLIMITED-TRACK		1527607570	5.89662981	-37.7687416
erick	0-3126007	UNLIMITED-TRACK		1527608187	5.90408993	-37.7670593
erick	0-3126007	UNLIMITED-TRACK		1527609368	5.91804981	-37.763279
erick	0-3126007	UNLIMITED-TRACK		1527608768	5.91097021	-37.7654305
erick	0-3126007	UNLIMITED-TRACK		1527609966	5.92540979	-37.7614098
erick	0-3126007	UNLIMITED-TRACK		1527610564	5.93132019	-37.7617798
erick	0-3126007	UNLIMITED-TRACK		1527611162	5.9389801	-37.7599182
erick	0-3126007	UNLIMITED-TRACK		1527611787	5.94726992	-37.7581787
erick	0-3126007	UNLIMITED-TRACK		1527612355	5.95533991	-37.7570496
erick	0-3126007	UNLIMITED-TRACK		1527612956	5.95844984	-37.7583885
erick	0-3126007	UNLIMITED-TRACK		1527613553	5.96576977	-37.7575989
erick	0-3126007	UNLIMITED-TRACK		1527614150	5.97255993	-37.7563515
erick	0-3126007	UNLIMITED-TRACK		1527614751	5.9794302	-37.7549706
erick	0-3126007	UNLIMITED-TRACK		1527615945	5.99260998	-37.7521706
erick	0-3126007	UNLIMITED-TRACK		1527616540	6.00026989	-37.7514305
erick	0-3126007	UNLIMITED-TRACK		1527615340	5.98632002	-37.7535782
erick	0-3126007	UNLIMITED-TRACK		1527617141	6.00712013	-37.7497597
erick	0-3126007	UNLIMITED-TRACK		1527618956	6.03112984	-37.74683
erick	0-3126007	UNLIMITED-TRACK		1527618356	6.02323008	-37.74786
erick	0-3126007	UNLIMITED-TRACK		1527617756	6.0149498	-37.7487984
erick	0-3126007	UNLIMITED-TRACK		1527620134	6.04593992	-37.7445107
erick	0-3126007	UNLIMITED-TRACK		1527621920	6.0646801	-37.7422485
erick	0-3126007	UNLIMITED-TRACK		1527621320	6.0604701	-37.7419891
erick	0-3126007	UNLIMITED-TRACK		1527620720	6.05305004	-37.7433586
erick	0-3126007	UNLIMITED-TRACK		1527622556	6.06186008	-37.7480812
erick	0-3126007	UNLIMITED-TRACK		1527623113	6.05704021	-37.7574501
erick	0-3126007	UNLIMITED-TRACK		1527623708	6.05128002	-37.7669106
erick	0-3126007	UNLIMITED-TRACK		1527624907	6.04018021	-37.7853394
erick	0-3126007	UNLIMITED-TRACK		1527624307	6.04558992	-37.7762413
erick	0-3126007	UNLIMITED-TRACK		1527625501	6.0370698	-37.7914696
erick	0-3126007	UNLIMITED-TRACK		1527626126	6.03598022	-37.7948914
erick	0-3126007	UNLIMITED-TRACK		1527626693	6.0381999	-37.7907715
erick	0-3126007	UNLIMITED-TRACK		1527627293	6.0391798	-37.7899513
erick	0-3126007	UNLIMITED-TRACK		1527627890	6.03999996	-37.7914391
erick	0-3126007	UNLIMITED-TRACK		1527628490	6.04014015	-37.7963295
erick	0-3126007	UNLIMITED-TRACK		1527629086	6.04015017	-37.8013306
erick	0-3126007	UNLIMITED-TRACK		1527629708	6.04035997	-37.8063011
erick	0-3126007	UNLIMITED-TRACK		1527630284	6.04079008	-37.8103294
erick	0-3126007	UNLIMITED-TRACK		1527631481	6.04047012	-37.8188782
erick	0-3126007	UNLIMITED-TRACK		1527630881	6.04047012	-37.8144188
erick	0-3126007	UNLIMITED-TRACK		1527632081	6.04060984	-37.8230896
erick	0-3126007	UNLIMITED-TRACK		1527632678	6.04121017	-37.8230591
erick	0-3126007	UNLIMITED-TRACK		1527633295	6.04249001	-37.8163109
erick	0-3126007	UNLIMITED-TRACK		1527633871	6.04410982	-37.8101196
erick	0-3126007	UNLIMITED-TRACK		1527634470	6.04799986	-37.8072205
erick	0-3126007	UNLIMITED-TRACK		1527635065	6.05203009	-37.8155212
erick	0-3126007	UNLIMITED-TRACK		1527635664	6.05495977	-37.8248596
erick	0-3126007	UNLIMITED-TRACK		1527636259	6.05805016	-37.8351707
erick	0-3126007	UNLIMITED-TRACK		1527636893	6.06112003	-37.8462486
erick	0-3126007	UNLIMITED-TRACK		1527637455	6.06419992	-37.8565712
erick	0-3126007	UNLIMITED-TRACK		1527638056	6.06722021	-37.8673706
erick	0-3126007	UNLIMITED-TRACK		1527639254	6.0665102	-37.8623009
erick	0-3126007	UNLIMITED-TRACK		1527638654	6.06724024	-37.8664207
erick	0-3126007	UNLIMITED-TRACK		1527639850	6.06572008	-37.8566895
erick	0-3126007	UNLIMITED-TRACK		1527640466	6.06592989	-37.8505592
erick	0-3126007	UNLIMITED-TRACK		1527641044	6.06644011	-37.8447304
erick	0-3126007	UNLIMITED-TRACK		1527641644	6.06718016	-37.8382607
erick	0-3126007	UNLIMITED-TRACK		1527642241	6.06781006	-37.8315697
erick	0-3126007	UNLIMITED-TRACK		1527642841	6.06521988	-37.8247414
erick	0-3126007	UNLIMITED-TRACK		1527643437	6.06313992	-37.8183594
erick	0-3126007	UNLIMITED-TRACK		1527644065	6.06273985	-37.8119507
erick	0-3126007	UNLIMITED-TRACK		1527644634	6.06311989	-37.8063698
erick	0-3126007	UNLIMITED-TRACK		1527645237	6.06352997	-37.7996216
erick	0-3126007	UNLIMITED-TRACK		1527645834	6.06416988	-37.7926598
erick	0-3126007	UNLIMITED-TRACK		1527646432	6.06509018	-37.7860413
erick	0-3126007	UNLIMITED-TRACK		1527647664	6.06835985	-37.7728004
erick	0-3126007	UNLIMITED-TRACK		1527647064	6.06629992	-37.7791481
erick	0-3126007	UNLIMITED-TRACK		1527648226	6.07115984	-37.7677002
erick	0-3126007	UNLIMITED-TRACK		1527649422	6.07436991	-37.7567101
erick	0-3126007	UNLIMITED-TRACK		1527648822	6.07278013	-37.7623711
erick	0-3126007	UNLIMITED-TRACK		1527650019	6.07600021	-37.7514305
erick	0-3126007	UNLIMITED-TRACK		1527650616	6.07888985	-37.7462196
erick	0-3126007	UNLIMITED-TRACK		1527651234	6.08103991	-37.7409706
erick	0-3126007	UNLIMITED-TRACK		1527651812	6.08268023	-37.735321
erick	0-3126007	UNLIMITED-TRACK		1527653605	6.08625984	-37.7209816
erick	0-3126007	UNLIMITED-TRACK		1527653005	6.08595991	-37.7257004
erick	0-3126007	UNLIMITED-TRACK		1527652405	6.08472013	-37.7303314
erick	0-3126007	UNLIMITED-TRACK		1527654202	6.08705997	-37.7196388
erick	0-3126007	UNLIMITED-TRACK		1527654835	6.08439016	-37.7223511
erick	0-3126007	UNLIMITED-TRACK		1527655999	6.08065987	-37.7274818
erick	0-3126007	UNLIMITED-TRACK		1527655399	6.08263016	-37.7250786
erick	0-3126007	UNLIMITED-TRACK		1527657196	6.0767498	-37.7327003
erick	0-3126007	UNLIMITED-TRACK		1527656596	6.07877016	-37.7302094
erick	0-3126007	UNLIMITED-TRACK		1527658417	6.07345009	-37.7381287
erick	0-3126007	UNLIMITED-TRACK		1527657817	6.07503986	-37.7353783
erick	0-3126007	UNLIMITED-TRACK		1527659591	6.07151985	-37.7444801
erick	0-3126007	UNLIMITED-TRACK		1527658991	6.07208014	-37.7405281
erick	0-3126007	UNLIMITED-TRACK		1527660187	6.07364988	-37.753479
erick	0-3126007	UNLIMITED-TRACK		1527660783	6.0763402	-37.7628517
erick	0-3126007	UNLIMITED-TRACK		1527661382	6.07923985	-37.7721291
erick	0-3126007	UNLIMITED-TRACK		1527662008	6.08285999	-37.7818909
erick	0-3126007	UNLIMITED-TRACK		1527662576	6.08520985	-37.7922707
erick	0-3126007	UNLIMITED-TRACK		1527663173	6.08821011	-37.8019409
erick	0-3126007	UNLIMITED-TRACK		1527663769	6.09111023	-37.8122292
erick	0-3126007	UNLIMITED-TRACK		1527664364	6.09389019	-37.8216896
erick	0-3126007	UNLIMITED-TRACK		1527664958	6.09661007	-37.8308105
erick	0-3126007	UNLIMITED-TRACK		1527665576	6.09863997	-37.8410606
erick	0-3126007	UNLIMITED-TRACK		1527666151	6.10028982	-37.8505592
erick	0-3126007	UNLIMITED-TRACK		1527666744	6.10170984	-37.8611488
erick	0-3126007	UNLIMITED-TRACK		1527667341	6.1035099	-37.8710594
erick	0-3126007	UNLIMITED-TRACK		1527668532	6.10060978	-37.8915405
erick	0-3126007	UNLIMITED-TRACK		1527667932	6.10233021	-37.8809013
erick	0-3126007	UNLIMITED-TRACK		1527669146	6.09603977	-37.9010887
erick	0-3126007	UNLIMITED-TRACK		1527669727	6.09298992	-37.9098511
erick	0-3126007	UNLIMITED-TRACK		1527670923	6.09203005	-37.9081116
erick	0-3126007	UNLIMITED-TRACK		1527670323	6.09185982	-37.9124908
erick	0-3126007	UNLIMITED-TRACK		1527671520	6.09190989	-37.9090004
erick	0-3126007	UNLIMITED-TRACK		1527672120	6.09233999	-37.9048195
erick	0-3126007	UNLIMITED-TRACK		1527672744	6.09173012	-37.8989601
erick	0-3126007	UNLIMITED-TRACK		1527673243	6.09135008	-37.8952904
erick	0-3126007	UNLIMITED-TRACK		1527673317	6.09130001	-37.8957481
erick	0-3126007	UNLIMITED-TRACK		1527673918	6.09129	-37.8931885
erick	0-3126007	UNLIMITED-TRACK		1527674514	6.09078979	-37.8955383
erick	0-3126007	UNLIMITED-TRACK		1527675109	6.09120989	-37.8940392
erick	0-3126007	UNLIMITED-TRACK		1527676327	6.08796978	-37.8813515
erick	0-3126007	UNLIMITED-TRACK		1527675727	6.08972979	-37.8877907
erick	0-3126007	UNLIMITED-TRACK		1527676901	6.0855999	-37.8744507
erick	0-3126007	UNLIMITED-TRACK		1527677499	6.08466005	-37.8678589
erick	0-3126007	UNLIMITED-TRACK		1527678694	6.08349991	-37.8535194
erick	0-3126007	UNLIMITED-TRACK		1527678094	6.08367014	-37.8605614
erick	0-3126007	UNLIMITED-TRACK		1527679915	6.08322001	-37.8390503
erick	0-3126007	UNLIMITED-TRACK		1527679315	6.08331013	-37.8461685
erick	0-3126007	UNLIMITED-TRACK		1527681085	6.08241987	-37.8262596
erick	0-3126007	UNLIMITED-TRACK		1527680485	6.08237982	-37.8326111
erick	0-3126007	UNLIMITED-TRACK		1527682279	6.08297014	-37.8137512
erick	0-3126007	UNLIMITED-TRACK		1527681679	6.08270979	-37.8196716
erick	0-3126007	UNLIMITED-TRACK		1527683498	6.08316994	-37.8012085
erick	0-3126007	UNLIMITED-TRACK		1527682898	6.08316994	-37.80756
erick	0-3126007	UNLIMITED-TRACK		1527685870	6.08639002	-37.7772484
erick	0-3126007	UNLIMITED-TRACK		1527685270	6.08433008	-37.7830009
erick	0-3126007	UNLIMITED-TRACK		1527684670	6.08316994	-37.7891808
erick	0-3126007	UNLIMITED-TRACK		1527686468	6.08849001	-37.7716408
erick	0-3126007	UNLIMITED-TRACK		1527687086	6.09065008	-37.7661095
erick	0-3126007	UNLIMITED-TRACK		1527687668	6.0924902	-37.7608604
erick	0-3126007	UNLIMITED-TRACK		1527688264	6.09337997	-37.7553406
erick	0-3126007	UNLIMITED-TRACK		1527688863	6.09385014	-37.7495384
erick	0-3126007	UNLIMITED-TRACK		1527689460	6.09368992	-37.7439613
erick	0-3126007	UNLIMITED-TRACK		1527690059	6.09399986	-37.7381592
erick	0-3126007	UNLIMITED-TRACK		1527690685	6.09206009	-37.7322388
erick	0-3126007	UNLIMITED-TRACK		1527691850	6.09127998	-37.7213097
erick	0-3126007	UNLIMITED-TRACK		1527691250	6.09240007	-37.7268906
erick	0-3126007	UNLIMITED-TRACK		1527692450	6.09280014	-37.7157288
erick	0-3126007	UNLIMITED-TRACK		1527693047	6.09370995	-37.7096596
erick	0-3126007	UNLIMITED-TRACK		1527694265	6.09627008	-37.6985817
erick	0-3126007	UNLIMITED-TRACK		1527694838	6.09732008	-37.6939697
erick	0-3126007	UNLIMITED-TRACK		1527693638	6.09499979	-37.7041016
erick	0-3126007	UNLIMITED-TRACK		1527695436	6.09800005	-37.6887512
erick	0-3126007	UNLIMITED-TRACK		1527696030	6.09838009	-37.6827698
erick	0-3126007	UNLIMITED-TRACK		1527696629	6.09882021	-37.6775208
erick	0-3126007	UNLIMITED-TRACK		1527697221	6.09899998	-37.6716919
erick	0-3126007	UNLIMITED-TRACK		1527697855	6.09880018	-37.66605
erick	0-3126007	UNLIMITED-TRACK		1527698419	6.09894991	-37.6606407
erick	0-3126007	UNLIMITED-TRACK		1527699015	6.09805012	-37.6549988
erick	0-3126007	UNLIMITED-TRACK		1527699615	6.09935999	-37.6497803
erick	0-3126007	UNLIMITED-TRACK		1527700212	6.09857988	-37.6495705
erick	0-3126007	UNLIMITED-TRACK		1527700808	6.09636021	-37.6521301
erick	0-3126007	UNLIMITED-TRACK		1527701425	6.0940299	-37.6551514
erick	0-3126007	UNLIMITED-TRACK		1527702007	6.09215021	-37.6583595
erick	0-3126007	UNLIMITED-TRACK		1527703199	6.08820009	-37.6650085
erick	0-3126007	UNLIMITED-TRACK		1527702599	6.09030008	-37.6616592
erick	0-3126007	UNLIMITED-TRACK		1527703799	6.0862298	-37.6683998
erick	0-3126007	UNLIMITED-TRACK		1527704398	6.08427	-37.671299
erick	0-3126007	UNLIMITED-TRACK		1527705025	6.08220005	-37.6747398
erick	0-3126007	UNLIMITED-TRACK		1527705592	6.08059978	-37.6773415
erick	0-3126007	UNLIMITED-TRACK		1527706195	6.07882023	-37.6800499
erick	0-3126007	UNLIMITED-TRACK		1527706786	6.07749987	-37.6825294
erick	0-3126007	UNLIMITED-TRACK		1527707385	6.07559013	-37.6928711
erick	0-3126007	UNLIMITED-TRACK		1527707980	6.07313013	-37.7033691
erick	0-3126007	UNLIMITED-TRACK		1527708595	6.06973982	-37.7143593
erick	0-3126007	UNLIMITED-TRACK		1527709177	6.06835985	-37.7246399
erick	0-3126007	UNLIMITED-TRACK		1527709775	6.06809998	-37.7346802
erick	0-3126007	UNLIMITED-TRACK		1527710376	6.06519985	-37.7450905
erick	0-3126007	UNLIMITED-TRACK		1527710975	6.06407022	-37.7473106
erick	0-3126007	UNLIMITED-TRACK		1527713368	6.06609011	-37.7367897
erick	0-3126007	UNLIMITED-TRACK		1527712768	6.06415987	-37.7428017
erick	0-3126007	UNLIMITED-TRACK		1527712168	6.06308985	-37.7488899
erick	0-3126007	UNLIMITED-TRACK		1527713965	6.06544018	-37.7304115
erick	0-3126007	UNLIMITED-TRACK		1527714565	6.06481981	-37.7237206
erick	0-3126007	UNLIMITED-TRACK		1527715796	6.06621981	-37.7110596
erick	0-3126007	UNLIMITED-TRACK		1527715196	6.06540012	-37.717411
erick	0-3126007	UNLIMITED-TRACK		1527716359	6.06539011	-37.7153282
erick	0-3126007	UNLIMITED-TRACK		1527717553	6.06856012	-37.7362709
erick	0-3126007	UNLIMITED-TRACK		1527716953	6.06676006	-37.726059
erick	0-3126007	UNLIMITED-TRACK		1527718154	6.07040977	-37.746891
erick	0-3126007	UNLIMITED-TRACK		1527718756	6.07211018	-37.7571106
erick	0-3126007	UNLIMITED-TRACK		1527719377	6.07412004	-37.7666893
erick	0-3126007	UNLIMITED-TRACK		1527719958	6.07246017	-37.7694397
erick	0-3126007	UNLIMITED-TRACK		1527721153	6.07595015	-37.7884483
erick	0-3126007	UNLIMITED-TRACK		1527720553	6.07367992	-37.7786713
erick	0-3126007	UNLIMITED-TRACK		1527721748	6.07787991	-37.7985191
erick	0-3126007	UNLIMITED-TRACK		1527722344	6.08128023	-37.8064308
erick	0-3126007	UNLIMITED-TRACK		1527723539	6.09717989	-37.8097801
erick	0-3126007	UNLIMITED-TRACK		1527722939	6.08971024	-37.808239
erick	0-3126007	UNLIMITED-TRACK		1527724138	6.10548019	-37.8101501
erick	0-3126007	UNLIMITED-TRACK		1527724736	6.11373997	-37.8116493
erick	0-3126007	UNLIMITED-TRACK		1527725332	6.12208986	-37.8129311
erick	0-3126007	UNLIMITED-TRACK		1527725930	6.1301198	-37.8135681
erick	0-3126007	UNLIMITED-TRACK		1527726565	6.13905001	-37.8144798
erick	0-3126007	UNLIMITED-TRACK		1527727125	6.14700985	-37.8161316
erick	0-3126007	UNLIMITED-TRACK		1527727721	6.15510988	-37.817749
erick	0-3126007	UNLIMITED-TRACK		1527728318	6.1627202	-37.8186989
erick	0-3126007	UNLIMITED-TRACK		1527730135	6.18766022	-37.8208313
erick	0-3126007	UNLIMITED-TRACK		1527729535	6.17902994	-37.8203201
erick	0-3126007	UNLIMITED-TRACK		1527728935	6.17087984	-37.8200607
erick	0-3126007	UNLIMITED-TRACK		1527730714	6.19605017	-37.8218689
erick	0-3126007	UNLIMITED-TRACK		1527731314	6.20481014	-37.8210411
erick	0-3126007	UNLIMITED-TRACK		1527732511	6.2234602	-37.821991
erick	0-3126007	UNLIMITED-TRACK		1527731911	6.21428013	-37.8213005
erick	0-3126007	UNLIMITED-TRACK		1527733736	6.24211979	-37.8247719
erick	0-3126007	UNLIMITED-TRACK		1527733136	6.2325902	-37.8232307
erick	0-3126007	UNLIMITED-TRACK		1527734900	6.25544024	-37.8238487
erick	0-3126007	UNLIMITED-TRACK		1527736095	6.2686801	-37.8252296
erick	0-3126007	UNLIMITED-TRACK		1527735495	6.26253986	-37.8239403
erick	0-3126007	UNLIMITED-TRACK		1527736695	6.2761302	-37.8257408
erick	0-3126007	UNLIMITED-TRACK		1527737316	6.28434992	-37.8265991
erick	0-3126007	UNLIMITED-TRACK		1527737892	6.29242992	-37.8283691
erick	0-3126007	UNLIMITED-TRACK		1527739090	6.30880022	-37.8302917
erick	0-3126007	UNLIMITED-TRACK		1527738490	6.30056	-37.8289986
erick	0-3126007	UNLIMITED-TRACK		1527740286	6.32380009	-37.8306618
erick	0-3126007	UNLIMITED-TRACK		1527739686	6.31753016	-37.8321991
erick	0-3126007	UNLIMITED-TRACK		1527740908	6.33150005	-37.8313293
erick	0-3126007	UNLIMITED-TRACK		1527741482	6.3391099	-37.8324585
erick	0-3126007	UNLIMITED-TRACK		1527742674	6.35360003	-37.8355713
erick	0-3126007	UNLIMITED-TRACK		1527742074	6.34608984	-37.8338509
erick	0-3126007	UNLIMITED-TRACK		1527743275	6.36221981	-37.8375206
erick	0-3126007	UNLIMITED-TRACK		1527743872	6.3712101	-37.8396912
erick	0-3126007	UNLIMITED-TRACK		1527745062	6.38675022	-37.8412819
erick	0-3126007	UNLIMITED-TRACK		1527744462	6.37914991	-37.8393898
erick	0-3126007	UNLIMITED-TRACK		1527745655	6.39479017	-37.8431702
erick	0-3126007	UNLIMITED-TRACK		1527746254	6.40280008	-37.8446999
erick	0-3126007	UNLIMITED-TRACK		1527746851	6.41082001	-37.8468285
erick	0-3126007	UNLIMITED-TRACK		1527747449	6.41877985	-37.8481407
erick	0-3126007	UNLIMITED-TRACK		1527748076	6.42844009	-37.8490906
erick	0-3126007	UNLIMITED-TRACK		1527748649	6.43677998	-37.850399
erick	0-3126007	UNLIMITED-TRACK		1527749246	6.44610977	-37.8521996
erick	0-3126007	UNLIMITED-TRACK		1527750443	6.46422005	-37.8543701
erick	0-3126007	UNLIMITED-TRACK		1527749843	6.45512009	-37.8531685
erick	0-3126007	UNLIMITED-TRACK		1527751042	6.47389984	-37.8559608
erick	0-3126007	UNLIMITED-TRACK		1527751673	6.48332024	-37.8572388
erick	0-3126007	UNLIMITED-TRACK		1527752832	6.50088978	-37.8597107
erick	0-3126007	UNLIMITED-TRACK		1527752232	6.49221992	-37.8580818
erick	0-3126007	UNLIMITED-TRACK		1527754027	6.51907015	-37.8605003
erick	0-3126007	UNLIMITED-TRACK		1527753427	6.51000977	-37.8605003
erick	0-3126007	UNLIMITED-TRACK		1527755245	6.53833008	-37.8629189
erick	0-3126007	UNLIMITED-TRACK		1527754645	6.52855015	-37.8616295
erick	0-3126007	UNLIMITED-TRACK		1527755821	6.54678011	-37.8633995
erick	0-3126007	UNLIMITED-TRACK		1527756416	6.55524015	-37.8647499
erick	0-3126007	UNLIMITED-TRACK		1527757015	6.56352997	-37.8668518
erick	0-3126007	UNLIMITED-TRACK		1527757610	6.57208014	-37.8687401
erick	0-3126007	UNLIMITED-TRACK		1527758828	6.58935022	-37.8698997
erick	0-3126007	UNLIMITED-TRACK		1527758228	6.58077002	-37.8698082
erick	0-3126007	UNLIMITED-TRACK		1527759399	6.59740019	-37.8712807
erick	0-3126007	UNLIMITED-TRACK		1527759649	6.60094023	-37.8719482
erick	0-3126007	UNLIMITED-TRACK		1527760000	6.60606003	-37.8733482
erick	0-3126007	UNLIMITED-TRACK		1527760596	6.6148901	-37.8757591
erick	0-3126007	UNLIMITED-TRACK		1527761193	6.61477995	-37.8779602
erick	0-3126007	UNLIMITED-TRACK		1527761792	6.62124014	-37.8786888
erick	0-3126007	UNLIMITED-TRACK		1527762986	6.63832998	-37.8807411
erick	0-3126007	UNLIMITED-TRACK		1527762386	6.62996006	-37.8796196
erick	0-3126007	UNLIMITED-TRACK		1527763584	6.64741993	-37.8822594
erick	0-3126007	UNLIMITED-TRACK		1527764178	6.65587997	-37.8837318
erick	0-3126007	UNLIMITED-TRACK		1527765372	6.67327023	-37.8867493
erick	0-3126007	UNLIMITED-TRACK		1527764772	6.66473007	-37.8855515
erick	0-3126007	UNLIMITED-TRACK		1527765989	6.68159008	-37.8875389
erick	0-3126007	UNLIMITED-TRACK		1527766567	6.68973017	-37.8880615
erick	0-3126007	UNLIMITED-TRACK		1527767760	6.70690012	-37.8905907
erick	0-3126007	UNLIMITED-TRACK		1527767160	6.69845009	-37.8895607
erick	0-3126007	UNLIMITED-TRACK		1527768358	6.7149601	-37.89188
erick	0-3126007	UNLIMITED-TRACK		1527768958	6.72297001	-37.8933105
erick	0-3126007	UNLIMITED-TRACK		1527769586	6.73191977	-37.8945885
erick	0-3126007	UNLIMITED-TRACK		1527770155	6.73951006	-37.8958092
erick	0-3126007	UNLIMITED-TRACK		1527770751	6.74759007	-37.8969116
erick	0-3126007	UNLIMITED-TRACK		1527771350	6.75575018	-37.8981285
erick	0-3126007	UNLIMITED-TRACK		1527771952	6.76381016	-37.8992004
erick	0-3126007	UNLIMITED-TRACK		1527772552	6.77235985	-37.8995399
erick	0-3126007	UNLIMITED-TRACK		1527774348	6.79846001	-37.9032288
erick	0-3126007	UNLIMITED-TRACK		1527773748	6.79000998	-37.9017715
erick	0-3126007	UNLIMITED-TRACK		1527773148	6.78177023	-37.90065
erick	0-3126007	UNLIMITED-TRACK		1527774951	6.80724001	-37.9043617
erick	0-3126007	UNLIMITED-TRACK		1527775551	6.81598997	-37.9053307
erick	0-3126007	UNLIMITED-TRACK		1527776147	6.82467985	-37.9063416
erick	0-3126007	UNLIMITED-TRACK		1527776787	6.8336401	-37.9075584
erick	0-3126007	UNLIMITED-TRACK		1527777347	6.84160995	-37.9083595
erick	0-3126007	UNLIMITED-TRACK		1527777949	6.85049009	-37.9105492
erick	0-3126007	UNLIMITED-TRACK		1527779148	6.86737013	-37.9116783
erick	0-3126007	UNLIMITED-TRACK		1527778548	6.85922003	-37.91082
erick	0-3126007	UNLIMITED-TRACK		1527780368	6.8843298	-37.9162292
erick	0-3126007	UNLIMITED-TRACK		1527779768	6.87540007	-37.9140015
erick	0-3126007	UNLIMITED-TRACK		1527780944	6.8920002	-37.9176903
erick	0-3126007	UNLIMITED-TRACK		1527781547	6.89991999	-37.9197083
erick	0-3126007	UNLIMITED-TRACK		1527782147	6.90812016	-37.9218407
erick	0-3126007	UNLIMITED-TRACK		1527782749	6.9165802	-37.9251099
erick	0-3126007	UNLIMITED-TRACK		1527783347	6.92487001	-37.9267006
erick	0-3126007	UNLIMITED-TRACK		1527783985	6.93375015	-37.9278297
erick	0-3126007	UNLIMITED-TRACK		1527784550	6.94200993	-37.9287109
erick	0-3126007	UNLIMITED-TRACK		1527785152	6.95060015	-37.9297485
erick	0-3126007	UNLIMITED-TRACK		1527785752	6.95830011	-37.9310303
erick	0-3126007	UNLIMITED-TRACK		1527786351	6.96597004	-37.9323997
erick	0-3126007	UNLIMITED-TRACK		1527786951	6.97376013	-37.9344482
erick	0-3126007	UNLIMITED-TRACK		1527787586	6.98253012	-37.9365807
erick	0-3126007	UNLIMITED-TRACK		1527788149	6.99081993	-37.9380798
erick	0-3126007	UNLIMITED-TRACK		1527789347	7.00796986	-37.9410095
erick	0-3126007	UNLIMITED-TRACK		1527788747	6.99900007	-37.9392891
erick	0-3126007	UNLIMITED-TRACK		1527790545	7.02595997	-37.9432983
erick	0-3126007	UNLIMITED-TRACK		1527789945	7.01733017	-37.9423599
erick	0-3126007	UNLIMITED-TRACK		1527791744	7.04285002	-37.9464684
erick	0-3126007	UNLIMITED-TRACK		1527791144	7.03473997	-37.9442406
erick	0-3126007	UNLIMITED-TRACK		1527792349	7.05137014	-37.9485817
erick	0-3126007	UNLIMITED-TRACK		1527792952	7.05962992	-37.9496803
erick	0-3126007	UNLIMITED-TRACK		1527793553	7.06872988	-37.9505005
erick	0-3126007	UNLIMITED-TRACK		1527795352	7.09645987	-37.9552612
erick	0-3126007	UNLIMITED-TRACK		1527794752	7.08761978	-37.9543991
erick	0-3126007	UNLIMITED-TRACK		1527794152	7.07778978	-37.9519997
erick	0-3126007	UNLIMITED-TRACK		1527795952	7.10584021	-37.9564209
erick	0-3126007	UNLIMITED-TRACK		1527796552	7.11525011	-37.9574013
erick	0-3126007	UNLIMITED-TRACK		1527797752	7.13372993	-37.9598694
erick	0-3126007	UNLIMITED-TRACK		1527797152	7.12454987	-37.95858
erick	0-3126007	UNLIMITED-TRACK		1527798386	7.14331007	-37.9614296
erick	0-3126007	UNLIMITED-TRACK		1527798951	7.14801979	-37.9630699
erick	0-3126007	UNLIMITED-TRACK		1527800145	7.14575005	-37.9685707
erick	0-3126007	UNLIMITED-TRACK		1527799545	7.14698982	-37.9658203
erick	0-3126007	UNLIMITED-TRACK		1527800748	7.14433002	-37.9712486
erick	0-3126007	UNLIMITED-TRACK		1527801968	7.1420002	-37.9769592
erick	0-3126007	UNLIMITED-TRACK		1527801368	7.14289999	-37.974041
erick	0-3126007	UNLIMITED-TRACK		1527802538	7.14485979	-37.9865112
erick	0-3126007	UNLIMITED-TRACK		1527803138	7.15285015	-37.9876404
erick	0-3126007	UNLIMITED-TRACK		1527803734	7.16163015	-37.9876099
erick	0-3126007	UNLIMITED-TRACK		1527804331	7.16975021	-37.9871788
erick	0-3126007	UNLIMITED-TRACK		1527804934	7.17761993	-37.9851112
erick	0-3126007	UNLIMITED-TRACK		1527805554	7.18628979	-37.9845886
erick	0-3126007	UNLIMITED-TRACK		1527806131	7.19429016	-37.9829407
erick	0-3126007	UNLIMITED-TRACK		1527806735	7.20266008	-37.9822388
erick	0-3126007	UNLIMITED-TRACK		1527807335	7.21148014	-37.9826698
erick	0-3126007	UNLIMITED-TRACK		1527807935	7.22083998	-37.9837303
erick	0-3126007	UNLIMITED-TRACK		1527808536	7.22964001	-37.9838905
erick	0-3126007	UNLIMITED-TRACK		1527809156	7.23913002	-37.9836998
erick	0-3126007	UNLIMITED-TRACK		1527810336	7.25740004	-37.9841003
erick	0-3126007	UNLIMITED-TRACK		1527809736	7.24800014	-37.9841919
erick	0-3126007	UNLIMITED-TRACK		1527810936	7.26619005	-37.9836693
erick	0-3126007	UNLIMITED-TRACK		1527811537	7.27397013	-37.9842796
erick	0-3126007	UNLIMITED-TRACK		1527812133	7.28076982	-37.9845581
erick	0-3126007	UNLIMITED-TRACK		1527812755	7.28938007	-37.9854393
erick	0-3126007	UNLIMITED-TRACK		1527814529	7.31119013	-37.9877892
erick	0-3126007	UNLIMITED-TRACK		1527813929	7.30436993	-37.9874496
erick	0-3126007	UNLIMITED-TRACK		1527813329	7.29686022	-37.9867592
erick	0-3126007	UNLIMITED-TRACK		1527815133	7.31883001	-37.9876709
erick	0-3126007	UNLIMITED-TRACK		1527815732	7.32687998	-37.9875488
erick	0-3126007	UNLIMITED-TRACK		1527816353	7.33466005	-37.9874306
erick	0-3126007	UNLIMITED-TRACK		1527816932	7.34247017	-37.9868813
erick	0-3126007	UNLIMITED-TRACK		1527817532	7.34928989	-37.9859886
erick	0-3126007	UNLIMITED-TRACK		1527818729	7.36720991	-37.9856606
erick	0-3126007	UNLIMITED-TRACK		1527818129	7.35832977	-37.9854889
erick	0-3126007	UNLIMITED-TRACK		1527819332	7.37573004	-37.9855995
erick	0-3126007	UNLIMITED-TRACK		1527820531	7.39194012	-37.9854088
erick	0-3126007	UNLIMITED-TRACK		1527819931	7.38438988	-37.9854088
erick	0-3126007	UNLIMITED-TRACK		1527821729	7.40630007	-37.9881897
erick	0-3126007	UNLIMITED-TRACK		1527822330	7.41311979	-37.9900513
erick	0-3126007	UNLIMITED-TRACK		1527821130	7.39917994	-37.9871292
erick	0-3126007	UNLIMITED-TRACK		1527823557	7.42951012	-37.9923706
erick	0-3126007	UNLIMITED-TRACK		1527822957	7.42130995	-37.9910011
\.


--
-- Data for Name: severities; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY severities (severity_id, severity_desc, severity_caption, is_alert, severity_order, severity_icon) FROM stdin;
\.


--
-- Name: severities_severity_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('severities_severity_id_seq', 1, false);


--
-- Data for Name: store; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY store (size, mimetype, encoding, originalname, fieldname, created_at, store_id, buffer) FROM stdin;
\.


--
-- Name: store_store_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('store_store_id_seq', 1, false);


--
-- Data for Name: sub_clients; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY sub_clients (sub, client_id) FROM stdin;
google-oauth2|109607129901015204468	1
auth0|5b0c67385d7d1617fd801e14	0
google-oauth2|116539243246073103581	1
auth0|5b0c6769e1fee066700d8333	0
auth0|5a5f93fc18189610ba2181da	0
google-oauth2|113000980893708448784	1
\.


--
-- Data for Name: vessels; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY vessels (vessel_id, vessel_name, client_id, esn, tank_capacity, insc_number, insc_issued, crew_number, insc_expire, draught_min, draught_max, ship_breadth, ship_lenght, created_at) FROM stdin;
2	ISAN	2	0-3126771	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-28 19:11:43.484729-03
3	TOMO	2	0-3123955	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-28 19:11:43.484729-03
-1	Globalstar (Arinos 1)	0	0-2530610	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-28 19:11:43.484729-03
-2	Mar (Arinos 2)	0	0-2807203	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-28 19:11:43.484729-03
9	Teste 3	1	5462	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-30 20:56:41.927-03
1	Tony Luan	1	0-3126007	2541	1	\N	\N	\N	\N	\N	\N	\N	2018-05-28 19:11:43.484729-03
11	Princesa do Agreste	1	3652-54	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-31 14:30:49.852-03
12	dfgdsg	1	dsfsadf	\N	\N	\N	\N	\N	\N	\N	\N	\N	2018-05-31 15:45:48.123-03
\.


--
-- Name: vessels_vessel_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('vessels_vessel_id_seq', 12, true);


--
-- Data for Name: voyages; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY voyages (voyage_id, voyage_desc, eta, etd, ata, atd, vessel_id, client_id, fishingtype_id, target_fish_id, master_id, created_at) FROM stdin;
5	fsdg	\N	\N	2018-05-21 21:02:16-03	2018-05-09 21:02:27-03	1	1	11	70	3	2018-05-17 02:56:32.27-03
29	\N	\N	\N	\N	2018-05-20 00:00:00-03	-1	0	4	4	3	2018-05-28 17:17:47.749-03
11	\N	\N	2018-05-02 00:00:00-03	\N	2018-05-22 21:04:30-03	1	1	4	4	3	2018-05-18 00:12:28.736-03
12	Teste de Save	2018-05-28 00:00:00-03	2018-05-27 00:00:00-03	2018-05-29 15:47:33.935-03	2018-05-27 00:00:00-03	1	1	5	221	3	2018-05-25 16:29:24.68-03
\.


--
-- Name: voyages_voyage_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('voyages_voyage_id_seq', 33, true);


--
-- Data for Name: winddir; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY winddir (winddir_id, winddir_desc) FROM stdin;
0	N
1	NE
2	E
3	SE
4	S
5	SW
6	W
7	NW
\.


--
-- Data for Name: winds; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY winds (wind_id, wind_desc) FROM stdin;
0	Calmo
1	Aragem
2	Brisa Leve
3	Brisa Fraca
4	Brisa Moderada
5	Brisa Forte
6	Vento Fresco
7	Vento Forte
8	Ventania
9	Ventania Forte
10	Tempestade
11	Tempestade Violenta
12	Furação
\.


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (address_id);


--
-- Name: alarmconditions alarmconditions_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmconditions
    ADD CONSTRAINT alarmconditions_pkey PRIMARY KEY (alarmcondition_id);


--
-- Name: conditions alarms_copy_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY conditions
    ADD CONSTRAINT alarms_copy_pkey PRIMARY KEY (condition_id);


--
-- Name: alarms alarms_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarms
    ADD CONSTRAINT alarms_pkey PRIMARY KEY (alarm_id);


--
-- Name: alarmtype_conditions alarmtypeconditions_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmtype_conditions
    ADD CONSTRAINT alarmtypeconditions_pkey PRIMARY KEY (alarmtype_id, alarmcondition_id);


--
-- Name: alarmtypes alarmtypes_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmtypes
    ADD CONSTRAINT alarmtypes_pkey PRIMARY KEY (alarmtype_id);


--
-- Name: alerts_log alerts_copy_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alerts_log
    ADD CONSTRAINT alerts_copy_pkey PRIMARY KEY (alarm_id, set_at);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (alarm_id, set_at);


--
-- Name: attachs attachs_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY attachs
    ADD CONSTRAINT attachs_pkey PRIMARY KEY (store_id, voyage_id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (client_id);


--
-- Name: crew crew_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY crew
    ADD CONSTRAINT crew_pkey PRIMARY KEY (voyage_id, person_id);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (domain_id);


--
-- Name: fishes fishes_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY fishes
    ADD CONSTRAINT fishes_pkey PRIMARY KEY (fish_id);


--
-- Name: fishingtypes fishingtypes_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY fishingtypes
    ADD CONSTRAINT fishingtypes_pkey PRIMARY KEY (fishingtype_id);


--
-- Name: lances lances_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY lances
    ADD CONSTRAINT lances_pkey PRIMARY KEY (lance_id);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY people
    ADD CONSTRAINT people_pkey PRIMARY KEY (person_id);


--
-- Name: geometries routes_copy_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY geometries
    ADD CONSTRAINT routes_copy_pkey PRIMARY KEY (geometry_id);


--
-- Name: severities severities_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY severities
    ADD CONSTRAINT severities_pkey PRIMARY KEY (severity_id);


--
-- Name: store store_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY store
    ADD CONSTRAINT store_pkey PRIMARY KEY (store_id);


--
-- Name: sub_clients sub_clients_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY sub_clients
    ADD CONSTRAINT sub_clients_pkey PRIMARY KEY (sub, client_id);


--
-- Name: vessels vessels_esn_key1; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY vessels
    ADD CONSTRAINT vessels_esn_key1 UNIQUE (esn);


--
-- Name: vessels vessels_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY vessels
    ADD CONSTRAINT vessels_pkey PRIMARY KEY (vessel_id);


--
-- Name: voyages voyages_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY voyages
    ADD CONSTRAINT voyages_pkey PRIMARY KEY (voyage_id);


--
-- Name: winddir winddir_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY winddir
    ADD CONSTRAINT winddir_pkey PRIMARY KEY (winddir_id);


--
-- Name: winds winds_pkey; Type: CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY winds
    ADD CONSTRAINT winds_pkey PRIMARY KEY (wind_id);


--
-- Name: addresses_address_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX addresses_address_id_key ON addresses USING btree (address_id);


--
-- Name: alarmconditions_alarmcondition_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX alarmconditions_alarmcondition_id_key ON alarmconditions USING btree (alarmcondition_id);


--
-- Name: alarms_alarm_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX alarms_alarm_id_key ON alarms USING btree (alarm_id);


--
-- Name: alarmtypes_alarmtype_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX alarmtypes_alarmtype_id_key ON alarmtypes USING btree (alarmtype_id);


--
-- Name: clients_client_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX clients_client_id_key ON clients USING btree (client_id);


--
-- Name: conditions_condition_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX conditions_condition_id_key ON conditions USING btree (condition_id);


--
-- Name: domains_domain_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX domains_domain_id_key ON domains USING btree (domain_id);


--
-- Name: fishes_fish_id_fishtype_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX fishes_fish_id_fishtype_id_key ON fishes USING btree (fish_id, fishingtype_id);


--
-- Name: fishes_fish_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX fishes_fish_id_key ON fishes USING btree (fish_id);


--
-- Name: fishingtypes_fishingtype_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX fishingtypes_fishingtype_id_key ON fishingtypes USING btree (fishingtype_id);


--
-- Name: geometries_geometry_id_client_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX geometries_geometry_id_client_id_key ON geometries USING btree (geometry_id, client_id);


--
-- Name: geometries_geometry_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX geometries_geometry_id_key ON geometries USING btree (geometry_id);


--
-- Name: people_person_id_client_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX people_person_id_client_id_key ON people USING btree (person_id, client_id);


--
-- Name: positions_tstamp_esn_idx; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE INDEX positions_tstamp_esn_idx ON positions USING btree (tstamp DESC NULLS LAST, esn);

ALTER TABLE positions CLUSTER ON positions_tstamp_esn_idx;


--
-- Name: severities_severity_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX severities_severity_id_key ON severities USING btree (severity_id);


--
-- Name: store_store_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX store_store_id_key ON store USING btree (store_id);


--
-- Name: vessels_esn_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX vessels_esn_key ON vessels USING btree (esn);


--
-- Name: vessels_vessel_id_client_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX vessels_vessel_id_client_id_key ON vessels USING btree (vessel_id, client_id);


--
-- Name: voyages_voyage_id_client_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX voyages_voyage_id_client_id_key ON voyages USING btree (voyage_id, client_id);


--
-- Name: voyages_voyage_id_client_id_vessel_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX voyages_voyage_id_client_id_vessel_id_key ON voyages USING btree (voyage_id, client_id, vessel_id);


--
-- Name: voyages_voyage_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX voyages_voyage_id_key ON voyages USING btree (voyage_id);


--
-- Name: winddir_winddir_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX winddir_winddir_id_key ON winddir USING btree (winddir_id);


--
-- Name: winds_wind_id_key; Type: INDEX; Schema: pesca; Owner: inkas
--

CREATE UNIQUE INDEX winds_wind_id_key ON winds USING btree (wind_id);


--
-- Name: alerts alert_ack; Type: TRIGGER; Schema: pesca; Owner: inkas
--

CREATE TRIGGER alert_ack BEFORE UPDATE OF ack ON alerts FOR EACH ROW EXECUTE PROCEDURE alert_ack();


--
-- Name: voyages checkATD; Type: TRIGGER; Schema: pesca; Owner: inkas
--

CREATE TRIGGER "checkATD" BEFORE INSERT OR UPDATE OF atd ON voyages FOR EACH ROW EXECUTE PROCEDURE "checkATD"();


--
-- Name: alarms check_alarms; Type: TRIGGER; Schema: pesca; Owner: inkas
--

CREATE TRIGGER check_alarms AFTER INSERT OR UPDATE ON alarms FOR EACH ROW EXECUTE PROCEDURE check_alarms();


--
-- Name: geometries check_geometries; Type: TRIGGER; Schema: pesca; Owner: inkas
--

CREATE TRIGGER check_geometries AFTER INSERT OR UPDATE ON geometries FOR EACH ROW EXECUTE PROCEDURE check_geometries();


--
-- Name: geometries geometry_upsert; Type: TRIGGER; Schema: pesca; Owner: inkas
--

CREATE TRIGGER geometry_upsert BEFORE INSERT OR UPDATE ON geometries FOR EACH ROW EXECUTE PROCEDURE geometry_upsert();


--
-- Name: lances setLanceDate; Type: TRIGGER; Schema: pesca; Owner: inkas
--

CREATE TRIGGER "setLanceDate" BEFORE INSERT OR UPDATE OF lance_start ON lances FOR EACH ROW EXECUTE PROCEDURE "setLanceDate"();


--
-- Name: alarms alarms_domain_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarms
    ADD CONSTRAINT alarms_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alarms alarms_severity_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarms
    ADD CONSTRAINT alarms_severity_id_fkey FOREIGN KEY (severity_id) REFERENCES severities(severity_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alarmtype_conditions alarmtypeconditions_alarmcondition_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmtype_conditions
    ADD CONSTRAINT alarmtypeconditions_alarmcondition_id_fkey FOREIGN KEY (alarmcondition_id) REFERENCES alarmconditions(alarmcondition_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alarmtype_conditions alarmtypeconditions_alarmtype_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmtype_conditions
    ADD CONSTRAINT alarmtypeconditions_alarmtype_id_fkey FOREIGN KEY (alarmtype_id) REFERENCES alarmtypes(alarmtype_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alarmtypes alarmtypes_domain_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alarmtypes
    ADD CONSTRAINT alarmtypes_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alerts alerts_alarm_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alerts
    ADD CONSTRAINT alerts_alarm_id_fkey FOREIGN KEY (alarm_id) REFERENCES alarms(alarm_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alerts_log alerts_log_alarm_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY alerts_log
    ADD CONSTRAINT alerts_log_alarm_id_fkey FOREIGN KEY (alarm_id) REFERENCES alarms(alarm_id) ON UPDATE CASCADE;


--
-- Name: attachs attachs_store_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY attachs
    ADD CONSTRAINT attachs_store_id_fkey FOREIGN KEY (store_id) REFERENCES store(store_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attachs attachs_voyage_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY attachs
    ADD CONSTRAINT attachs_voyage_id_fkey FOREIGN KEY (voyage_id) REFERENCES voyages(voyage_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clients clients_address_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT clients_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conditions conditions_alarm_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY conditions
    ADD CONSTRAINT conditions_alarm_id_fkey FOREIGN KEY (alarm_id) REFERENCES alarms(alarm_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conditions conditions_alarmcondition_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY conditions
    ADD CONSTRAINT conditions_alarmcondition_id_fkey FOREIGN KEY (alarmcondition_id) REFERENCES alarmconditions(alarmcondition_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conditions conditions_alarmtype_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY conditions
    ADD CONSTRAINT conditions_alarmtype_id_fkey FOREIGN KEY (alarmtype_id) REFERENCES alarmtypes(alarmtype_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conditions conditions_geometry_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY conditions
    ADD CONSTRAINT conditions_geometry_id_fkey FOREIGN KEY (geometry_id) REFERENCES geometries(geometry_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: crew crew_person_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY crew
    ADD CONSTRAINT crew_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(person_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: crew crew_voyage_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY crew
    ADD CONSTRAINT crew_voyage_id_fkey FOREIGN KEY (voyage_id) REFERENCES voyages(voyage_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fishes fishes_fishtype_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY fishes
    ADD CONSTRAINT fishes_fishtype_id_fkey FOREIGN KEY (fishingtype_id) REFERENCES fishingtypes(fishingtype_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: geometries geometries_client_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY geometries
    ADD CONSTRAINT geometries_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lances lances_fish_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY lances
    ADD CONSTRAINT lances_fish_id_fkey FOREIGN KEY (fish_id) REFERENCES fishes(fish_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lances lances_voyage_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY lances
    ADD CONSTRAINT lances_voyage_id_fkey FOREIGN KEY (voyage_id) REFERENCES voyages(voyage_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lances lances_wind_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY lances
    ADD CONSTRAINT lances_wind_id_fkey FOREIGN KEY (wind_id) REFERENCES winds(wind_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lances lances_winddir_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY lances
    ADD CONSTRAINT lances_winddir_id_fkey FOREIGN KEY (winddir_id) REFERENCES winddir(winddir_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: people people_address_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY people
    ADD CONSTRAINT people_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: people people_client_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY people
    ADD CONSTRAINT people_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: positions positions_esn_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY positions
    ADD CONSTRAINT positions_esn_fkey FOREIGN KEY (esn) REFERENCES vessels(esn) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sub_clients sub_clients_client_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY sub_clients
    ADD CONSTRAINT sub_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: vessels vessels_client_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY vessels
    ADD CONSTRAINT vessels_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voyages voyages_master_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY voyages
    ADD CONSTRAINT voyages_master_id_fkey FOREIGN KEY (master_id) REFERENCES people(person_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voyages voyages_target_fish_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY voyages
    ADD CONSTRAINT voyages_target_fish_id_fkey FOREIGN KEY (target_fish_id, fishingtype_id) REFERENCES fishes(fish_id, fishingtype_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voyages voyages_vessel_id_fkey; Type: FK CONSTRAINT; Schema: pesca; Owner: inkas
--

ALTER TABLE ONLY voyages
    ADD CONSTRAINT voyages_vessel_id_fkey FOREIGN KEY (vessel_id, client_id) REFERENCES vessels(vessel_id, client_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

