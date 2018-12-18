/*
 Navicat PostgreSQL Data Transfer

 Source Server         : Thiamat
 Source Server Version : 90601
 Source Host           : localhost
 Source Database       : inkas
 Source Schema         : pesca

 Target Server Version : 90601
 File Encoding         : utf-8

 Date: 12/18/2018 00:11:19 AM
*/

-- ----------------------------
--  Sequence structure for alarmconditions_alarmcondition_id
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."alarmconditions_alarmcondition_id";
CREATE SEQUENCE "pesca"."alarmconditions_alarmcondition_id" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."alarmconditions_alarmcondition_id" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for alarms_alarm_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."alarms_alarm_id_seq";
CREATE SEQUENCE "pesca"."alarms_alarm_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."alarms_alarm_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for alarmtypes_alarmtype_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."alarmtypes_alarmtype_id_seq";
CREATE SEQUENCE "pesca"."alarmtypes_alarmtype_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."alarmtypes_alarmtype_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for checks_check_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."checks_check_id_seq";
CREATE SEQUENCE "pesca"."checks_check_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."checks_check_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for client_checktypes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."client_checktypes_id_seq";
CREATE SEQUENCE "pesca"."client_checktypes_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."client_checktypes_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for clients_client_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."clients_client_id_seq";
CREATE SEQUENCE "pesca"."clients_client_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."clients_client_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for conditions_condition_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."conditions_condition_id_seq";
CREATE SEQUENCE "pesca"."conditions_condition_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."conditions_condition_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for fishes_fish_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."fishes_fish_id_seq";
CREATE SEQUENCE "pesca"."fishes_fish_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."fishes_fish_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for fishingtypes_fishingtype_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."fishingtypes_fishingtype_id_seq";
CREATE SEQUENCE "pesca"."fishingtypes_fishingtype_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."fishingtypes_fishingtype_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for geometries_geometry_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."geometries_geometry_id_seq";
CREATE SEQUENCE "pesca"."geometries_geometry_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."geometries_geometry_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for journeys_journey_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."journeys_journey_id_seq";
CREATE SEQUENCE "pesca"."journeys_journey_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."journeys_journey_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for lances_lance_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."lances_lance_id_seq";
CREATE SEQUENCE "pesca"."lances_lance_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."lances_lance_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for people_person_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."people_person_id_seq";
CREATE SEQUENCE "pesca"."people_person_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."people_person_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for ports_port_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."ports_port_id_seq";
CREATE SEQUENCE "pesca"."ports_port_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."ports_port_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for positions_position_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."positions_position_id_seq1";
CREATE SEQUENCE "pesca"."positions_position_id_seq1" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."positions_position_id_seq1" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for provisions_provision_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."provisions_provision_id_seq";
CREATE SEQUENCE "pesca"."provisions_provision_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."provisions_provision_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for services_service_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."services_service_id_seq";
CREATE SEQUENCE "pesca"."services_service_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."services_service_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for severities_severity_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."severities_severity_id_seq";
CREATE SEQUENCE "pesca"."severities_severity_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."severities_severity_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for store_store_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."store_store_id_seq";
CREATE SEQUENCE "pesca"."store_store_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."store_store_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for vessel_checks_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."vessel_checks_id_seq";
CREATE SEQUENCE "pesca"."vessel_checks_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."vessel_checks_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for vessel_fishingtypes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."vessel_fishingtypes_id_seq";
CREATE SEQUENCE "pesca"."vessel_fishingtypes_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."vessel_fishingtypes_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for vessel_people_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."vessel_people_id_seq";
CREATE SEQUENCE "pesca"."vessel_people_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."vessel_people_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for vessels_vessel_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."vessels_vessel_id_seq";
CREATE SEQUENCE "pesca"."vessels_vessel_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."vessels_vessel_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Sequence structure for voyages_voyage_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "pesca"."voyages_voyage_id_seq";
CREATE SEQUENCE "pesca"."voyages_voyage_id_seq" INCREMENT 1 START 1 MAXVALUE 9223372036854775807 MINVALUE 1 CACHE 1;
ALTER TABLE "pesca"."voyages_voyage_id_seq" OWNER TO "inkas";

-- ----------------------------
--  Function structure for pesca.check_alarm(int4)
-- ----------------------------
DROP FUNCTION IF EXISTS "pesca"."check_alarm"(int4);
CREATE FUNCTION "pesca"."check_alarm"(IN _alarm_id int4) RETURNS "int4" 
	AS $BODY$





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
$BODY$
	LANGUAGE plpgsql
	COST 100
	STRICT
	SECURITY INVOKER
	VOLATILE;
ALTER FUNCTION "pesca"."check_alarm"(IN _alarm_id int4) OWNER TO "inkas";

-- ----------------------------
--  Function structure for pesca.PosWhen(int4, timestamptz)
-- ----------------------------
DROP FUNCTION IF EXISTS "pesca"."PosWhen"(int4, timestamptz);
CREATE FUNCTION "pesca"."PosWhen"(IN v_id int4, IN "t" timestamptz, OUT _lon float8, OUT _lat float8) RETURNS "record" 
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
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;
ALTER FUNCTION "pesca"."PosWhen"(IN v_id int4, IN "t" timestamptz, OUT _lon float8, OUT _lat float8) OWNER TO "inkas";

-- ----------------------------
--  Table structure for winds
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."winds";
CREATE TABLE "pesca"."winds" (
	"wind_id" int4 NOT NULL,
	"wind_desc" varchar NOT NULL COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."winds" OWNER TO "inkas";

-- ----------------------------
--  Table structure for winddir
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."winddir";
CREATE TABLE "pesca"."winddir" (
	"winddir_id" int4 NOT NULL,
	"winddir_desc" varchar NOT NULL COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."winddir" OWNER TO "inkas";

-- ----------------------------
--  Table structure for alarms
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."alarms";
CREATE TABLE "pesca"."alarms" (
	"alarm_id" int4 NOT NULL DEFAULT nextval('alarms_alarm_id_seq'::regclass),
	"alarm_desc" varchar NOT NULL COLLATE "default",
	"alarm_active" bool NOT NULL DEFAULT true,
	"severity_id" int4 NOT NULL DEFAULT 1,
	"weight" float8 NOT NULL DEFAULT 1.0,
	"entity_id" int4 NOT NULL,
	"domain_id" int4 NOT NULL,
	"TopicArn" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."alarms" OWNER TO "inkas";

-- ----------------------------
--  Table structure for alarmconditions
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."alarmconditions";
CREATE TABLE "pesca"."alarmconditions" (
	"alarmcondition_id" int4 NOT NULL DEFAULT nextval('alarmconditions_alarmcondition_id'::regclass),
	"alarmcondition_desc" varchar NOT NULL COLLATE "default",
	"alarmcondition_caption" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."alarmconditions" OWNER TO "inkas";

-- ----------------------------
--  Table structure for alarmtypes
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."alarmtypes";
CREATE TABLE "pesca"."alarmtypes" (
	"alarmtype_id" int4 NOT NULL DEFAULT nextval('alarmtypes_alarmtype_id_seq'::regclass),
	"alarmtype_desc" varchar NOT NULL COLLATE "default",
	"alarmtype_caption" varchar NOT NULL COLLATE "default",
	"domain_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."alarmtypes" OWNER TO "inkas";

-- ----------------------------
--  Table structure for crew
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."crew";
CREATE TABLE "pesca"."crew" (
	"voyage_id" int4 NOT NULL,
	"person_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."crew" OWNER TO "inkas";

-- ----------------------------
--  Table structure for conditions_failed
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."conditions_failed";
CREATE TABLE "pesca"."conditions_failed" (
	"alarm_id" int4 NOT NULL,
	"alarmtype_id" int4 NOT NULL,
	"alarmcondition_id" int4,
	"value_number" float8,
	"condition_id" int4 NOT NULL,
	"geometry_id" int4,
	"value_tstamp" timestamp(6) WITH TIME ZONE,
	"client_id" int4 NOT NULL,
	"vessel_id" int4 NOT NULL,
	"checked_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"alarm_desc" varchar COLLATE "default",
	"alarm_weight" float8,
	"severity_id" int4 NOT NULL,
	"entity_id" int4 NOT NULL,
	"domain_id" int4 NOT NULL,
	"checked_last" bool NOT NULL DEFAULT true,
	"condition_message" varchar COLLATE "default",
	"position_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."conditions_failed" OWNER TO "inkas";

-- ----------------------------
--  Table structure for lances
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."lances";
CREATE TABLE "pesca"."lances" (
	"lance_id" int4 NOT NULL DEFAULT nextval('lances_lance_id_seq'::regclass),
	"voyage_id" int4 NOT NULL,
	"fish_id" int4 NOT NULL,
	"weight" float8 NOT NULL DEFAULT 0,
	"winddir_id" int4 DEFAULT 0,
	"wind_id" int4 DEFAULT 0,
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"lance_start" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"temp" float8,
	"lance_end" timestamp(6) WITH TIME ZONE,
	"depth" float8,
	"lat" float8,
	"lon" float8
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."lances" OWNER TO "inkas";

-- ----------------------------
--  Table structure for vessels
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."vessels";
CREATE TABLE "pesca"."vessels" (
	"vessel_id" int4 NOT NULL DEFAULT nextval('vessels_vessel_id_seq'::regclass),
	"vessel_name" varchar NOT NULL DEFAULT 'ATIVADO'::character varying COLLATE "default",
	"esn" varchar NOT NULL COLLATE "default",
	"tank_capacity" float4,
	"insc_number" varchar COLLATE "default",
	"insc_issued" timestamp(6) WITH TIME ZONE,
	"crew_number" int4,
	"insc_expire" timestamp(6) WITH TIME ZONE,
	"draught_min" float4,
	"draught_max" float4,
	"ship_breadth" float4,
	"ship_lenght" float4,
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"port_id" int4,
	"client_id" int4 NOT NULL DEFAULT 0
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."vessels" OWNER TO "inkas";

-- ----------------------------
--  Table structure for fishes
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."fishes";
CREATE TABLE "pesca"."fishes" (
	"fish_id" int4 NOT NULL DEFAULT nextval('fishes_fish_id_seq'::regclass),
	"fish_name" varchar NOT NULL COLLATE "default",
	"fishingtype_id" int4
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."fishes" OWNER TO "inkas";

-- ----------------------------
--  Table structure for clients
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."clients";
CREATE TABLE "pesca"."clients" (
	"client_id" int4 NOT NULL DEFAULT nextval('clients_client_id_seq'::regclass),
	"client_name" varchar NOT NULL COLLATE "default",
	"cnpj" varchar COLLATE "default",
	"address_id" int4,
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now()
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."clients" OWNER TO "inkas";

-- ----------------------------
--  Table structure for fishingtypes
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."fishingtypes";
CREATE TABLE "pesca"."fishingtypes" (
	"fishingtype_id" int4 NOT NULL DEFAULT nextval('fishingtypes_fishingtype_id_seq'::regclass),
	"fishingtype_desc" varchar NOT NULL COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."fishingtypes" OWNER TO "inkas";

-- ----------------------------
--  Table structure for conditions
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."conditions";
CREATE TABLE "pesca"."conditions" (
	"alarm_id" int4 NOT NULL,
	"alarmtype_id" int4 NOT NULL,
	"alarmcondition_id" int4,
	"value_number" float8,
	"condition_id" int4 NOT NULL DEFAULT nextval('conditions_condition_id_seq'::regclass),
	"geometry_id" int4,
	"value_tstamp" timestamp(6) WITH TIME ZONE
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."conditions" OWNER TO "inkas";

-- ----------------------------
--  Table structure for domains
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."domains";
CREATE TABLE "pesca"."domains" (
	"domain_id" int4 NOT NULL,
	"domain_desc" varchar NOT NULL COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."domains" OWNER TO "inkas";

-- ----------------------------
--  Table structure for alerts_log
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."alerts_log";
CREATE TABLE "pesca"."alerts_log" (
	"alarm_id" int4 NOT NULL,
	"set_at" timestamp(6) WITH TIME ZONE NOT NULL,
	"ack_at" timestamp(6) WITH TIME ZONE,
	"off_at" timestamp(6) WITH TIME ZONE NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."alerts_log" OWNER TO "inkas";

-- ----------------------------
--  Table structure for alerts
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."alerts";
CREATE TABLE "pesca"."alerts" (
	"alarm_id" int4 NOT NULL,
	"set_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"ack_at" timestamp(6) WITH TIME ZONE,
	"ack" bool NOT NULL DEFAULT false,
	"is_alert" bool NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."alerts" OWNER TO "inkas";

-- ----------------------------
--  Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."addresses";
CREATE TABLE "pesca"."addresses" (
	"address_id" int4 NOT NULL,
	"logradouro" varchar COLLATE "default",
	"numeral" varchar COLLATE "default",
	"complemento" varchar COLLATE "default",
	"cep" varchar COLLATE "default",
	"cidade" varchar COLLATE "default",
	"estado" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."addresses" OWNER TO "inkas";

-- ----------------------------
--  Table structure for client_people_star
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."client_people_star";
CREATE TABLE "pesca"."client_people_star" (
	"client_id" int4 NOT NULL,
	"person_id" int4 NOT NULL,
	"wants" bool NOT NULL DEFAULT false,
	"works" bool NOT NULL DEFAULT false
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."client_people_star" OWNER TO "inkas";

-- ----------------------------
--  Table structure for people
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."people";
CREATE TABLE "pesca"."people" (
	"person_id" int4 NOT NULL DEFAULT nextval('people_person_id_seq'::regclass),
	"person_name" varchar COLLATE "default",
	"rgi_number" varchar COLLATE "default",
	"cpf" varchar COLLATE "default",
	"pis" varchar COLLATE "default",
	"birthday" timestamp(6) WITH TIME ZONE,
	"rgp_number" varchar COLLATE "default",
	"rgp_issued" timestamp(6) WITH TIME ZONE,
	"rgp_permit" int4,
	"rgp_expire" timestamp(6) WITH TIME ZONE,
	"ric_number" varchar COLLATE "default",
	"address_id" int4,
	"master" bool NOT NULL DEFAULT false,
	"rgi_issued" varchar COLLATE "default",
	"rgi_expire" timestamp(6) WITH TIME ZONE,
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"ric_issued" timestamp(6) WITH TIME ZONE,
	"ric_expire" timestamp(6) WITH TIME ZONE,
	"rgi_issuer" varchar COLLATE "default",
	"area_id" int4
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."people" OWNER TO "inkas";

-- ----------------------------
--  Table structure for voyages
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."voyages";
CREATE TABLE "pesca"."voyages" (
	"voyage_id" int4 NOT NULL DEFAULT nextval('voyages_voyage_id_seq'::regclass),
	"voyage_desc" varchar COLLATE "default",
	"ata" timestamp(6) WITH TIME ZONE,
	"atd" timestamp(6) WITH TIME ZONE,
	"vessel_id" int4 NOT NULL,
	"fishingtype_id" int4,
	"target_fish_id" int4,
	"master_id" int4,
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"etd" timestamp(6) WITH TIME ZONE,
	"eta" timestamp(6) WITH TIME ZONE,
	"journey_id" int4
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."voyages" OWNER TO "inkas";

-- ----------------------------
--  Table structure for severities
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."severities";
CREATE TABLE "pesca"."severities" (
	"severity_id" int4 NOT NULL DEFAULT nextval('severities_severity_id_seq'::regclass),
	"severity_desc" varchar NOT NULL COLLATE "default",
	"severity_caption" varchar NOT NULL COLLATE "default",
	"is_alert" bool NOT NULL DEFAULT true,
	"severity_order" int4 NOT NULL,
	"severity_icon" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."severities" OWNER TO "inkas";

-- ----------------------------
--  Table structure for alarmtype_conditions
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."alarmtype_conditions";
CREATE TABLE "pesca"."alarmtype_conditions" (
	"alarmtype_id" int4 NOT NULL,
	"alarmcondition_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."alarmtype_conditions" OWNER TO "inkas";

-- ----------------------------
--  Table structure for store
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."store";
CREATE TABLE "pesca"."store" (
	"size" int4 NOT NULL,
	"mimetype" varchar NOT NULL COLLATE "default",
	"encoding" varchar NOT NULL COLLATE "default",
	"originalname" varchar NOT NULL COLLATE "default",
	"fieldname" varchar NOT NULL COLLATE "default",
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL,
	"store_id" int4 NOT NULL DEFAULT nextval('store_store_id_seq'::regclass),
	"buffer" bytea
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."store" OWNER TO "inkas";

-- ----------------------------
--  Table structure for attachs
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."attachs";
CREATE TABLE "pesca"."attachs" (
	"store_id" int4 NOT NULL,
	"voyage_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."attachs" OWNER TO "inkas";

-- ----------------------------
--  Table structure for client_people
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."client_people";
CREATE TABLE "pesca"."client_people" (
	"client_id" int4 NOT NULL,
	"person_id" int4 NOT NULL,
	"id" int4 NOT NULL DEFAULT nextval('vessel_people_id_seq'::regclass),
	"work_start" timestamp(6) WITH TIME ZONE,
	"work_end" timestamp(6) WITH TIME ZONE
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."client_people" OWNER TO "inkas";

-- ----------------------------
--  Table structure for services
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."services";
CREATE TABLE "pesca"."services" (
	"service_id" int4 NOT NULL DEFAULT nextval('services_service_id_seq'::regclass),
	"start" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now(),
	"finish" timestamp(6) WITH TIME ZONE,
	"vessel_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."services" OWNER TO "inkas";

-- ----------------------------
--  Table structure for checks
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."checks";
CREATE TABLE "pesca"."checks" (
	"check_id" int4 NOT NULL DEFAULT nextval('checks_check_id_seq'::regclass),
	"check_desc" varchar NOT NULL COLLATE "default",
	"check_order" int4 NOT NULL DEFAULT 0,
	"check_subject" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."checks" OWNER TO "inkas";

-- ----------------------------
--  Table structure for geometries
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."geometries";
CREATE TABLE "pesca"."geometries" (
	"geometry_id" int4 NOT NULL DEFAULT nextval('geometries_geometry_id_seq'::regclass),
	"geometry_name" varchar NOT NULL COLLATE "default",
	"client_id" int4 NOT NULL,
	"entities" int4 NOT NULL,
	"dimensions" int4 NOT NULL,
	"geometry_type" varchar NOT NULL COLLATE "default",
	"geom_geojson" varchar NOT NULL COLLATE "default",
	"geom_4326" "public"."geometry"
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."geometries" OWNER TO "inkas";

-- ----------------------------
--  Table structure for vessel_fishingtypes
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."vessel_fishingtypes";
CREATE TABLE "pesca"."vessel_fishingtypes" (
	"vessel_id" int4 NOT NULL,
	"fishingtype_id" int4 NOT NULL,
	"id" int4 NOT NULL DEFAULT nextval('vessel_fishingtypes_id_seq'::regclass)
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."vessel_fishingtypes" OWNER TO "inkas";

-- ----------------------------
--  Table structure for vessel_checktypes
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."vessel_checktypes";
CREATE TABLE "pesca"."vessel_checktypes" (
	"vessel_id" int4 NOT NULL,
	"check_id" int4 NOT NULL,
	"id" int4 NOT NULL DEFAULT nextval('vessel_checks_id_seq'::regclass)
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."vessel_checktypes" OWNER TO "inkas";

-- ----------------------------
--  Table structure for client_checktypes
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."client_checktypes";
CREATE TABLE "pesca"."client_checktypes" (
	"id" int4 NOT NULL DEFAULT nextval('client_checktypes_id_seq'::regclass),
	"client_id" int4 NOT NULL,
	"check_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."client_checktypes" OWNER TO "inkas";

-- ----------------------------
--  Table structure for provisions_smart1
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."provisions_smart1";
CREATE TABLE "pesca"."provisions_smart1" (
	"provision_id" int4 NOT NULL DEFAULT nextval('provisions_provision_id_seq'::regclass),
	"esn" varchar COLLATE "default",
	"provid" int4,
	"tstart" varchar COLLATE "default",
	"tend" varchar COLLATE "default",
	"txretryminsec" int4,
	"txretrymaxsec" int4,
	"txretries" int4,
	"rfchannel" varchar COLLATE "default",
	"created_at" timestamp(6) WITH TIME ZONE NOT NULL DEFAULT now()
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."provisions_smart1" OWNER TO "inkas";

-- ----------------------------
--  Table structure for devices
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."devices";
CREATE TABLE "pesca"."devices" (
	"esn" varchar NOT NULL COLLATE "default",
	"miss_after" interval(6) NOT NULL DEFAULT '02:00:00'::interval,
	"lost_after" interval(6) NOT NULL DEFAULT '12:00:00'::interval
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."devices" OWNER TO "inkas";

-- ----------------------------
--  Table structure for positions
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."positions";
CREATE TABLE "pesca"."positions" (
	"position_id" int8 NOT NULL DEFAULT nextval('positions_position_id_seq1'::regclass),
	"esn" varchar COLLATE "default",
	"tstamp" int4,
	"lat" float4,
	"lon" float4,
	"head" int2,
	"sog" int2,
	"input1" bool,
	"input2" bool,
	"vibration" bool,
	"battery_fail" bool,
	"external_power" bool
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."positions" OWNER TO "inkas";

-- ----------------------------
--  Table structure for journeys
-- ----------------------------
DROP TABLE IF EXISTS "pesca"."journeys";
CREATE TABLE "pesca"."journeys" (
	"journey_id" int4 NOT NULL DEFAULT nextval('journeys_journey_id_seq'::regclass),
	"vessel_id" int4 NOT NULL,
	"ata" timestamp(6) WITH TIME ZONE,
	"atd" timestamp(6) WITH TIME ZONE NOT NULL,
	"area_id" int4 NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "pesca"."journeys" OWNER TO "inkas";

-- ----------------------------
--  View structure for fishing
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."fishing";
CREATE VIEW "pesca"."fishing" AS  SELECT voyages.vessel_id,
    voyages.voyage_id
   FROM voyages
  WHERE ((voyages.atd IS NOT NULL) AND (voyages.ata IS NULL));

-- ----------------------------
--  View structure for servicing
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."servicing";
CREATE VIEW "pesca"."servicing" AS  SELECT services.service_id,
    services.start,
    services.finish,
    services.vessel_id
   FROM services
  WHERE (services.finish IS NULL);

-- ----------------------------
--  View structure for seascape
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."seascape";
CREATE VIEW "pesca"."seascape" AS  WITH scape AS (
         SELECT p.esn,
            max(p.tstamp) AS tstamp,
            to_timestamp((max(p.tstamp))::double precision) AS lastseen,
            (now() - to_timestamp((max(p.tstamp))::double precision)) AS age
           FROM positions p
          GROUP BY p.esn
        ), docked AS (
         SELECT scape.esn,
            scape.tstamp,
            scape.lastseen,
            scape.age,
            dev.miss_after,
            dev.lost_after,
            pos.lat,
            pos.lon,
            pos.sog,
            pos.head,
            pos.input1,
            pos.input2,
            pos.battery_fail,
            pos.external_power,
            pos.vibration,
            cli.client_id,
            cli.client_name,
            ves.vessel_id,
            ves.vessel_name,
            ves.port_id,
            srv.service_id,
            (srv.service_id IS NOT NULL) AS down,
            st_within(st_setsrid(st_point((pos.lon)::double precision, (pos.lat)::double precision), 4326), geo.geom_4326) AS dock
           FROM ((((((devices dev
             LEFT JOIN scape USING (esn))
             LEFT JOIN vessels ves USING (esn))
             LEFT JOIN servicing srv USING (vessel_id))
             LEFT JOIN clients cli USING (client_id))
             LEFT JOIN positions pos USING (tstamp, esn))
             LEFT JOIN geometries geo ON ((ves.port_id = geo.geometry_id)))
        )
 SELECT docked.esn,
    docked.tstamp,
    docked.lastseen,
    docked.age,
    docked.miss_after,
    docked.lost_after,
    docked.lat,
    docked.lon,
    docked.sog,
    docked.head,
    docked.input1,
    docked.input2,
    docked.battery_fail,
    docked.external_power,
    docked.vibration,
    docked.client_id,
    docked.client_name,
    docked.vessel_id,
    docked.vessel_name,
    docked.port_id,
    docked.service_id,
    docked.down,
    docked.dock,
    (((now() - docked.lastseen) >= docked.miss_after) AND ((now() - docked.lastseen) <= docked.lost_after)) AS miss,
    ((now() - docked.lastseen) > docked.lost_after) AS lost,
    ((now() - docked.lastseen) < docked.miss_after) AS live
   FROM docked;

-- ----------------------------
--  View structure for fleethealth
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."fleethealth";
CREATE VIEW "pesca"."fleethealth" AS  SELECT seascape.client_id,
    count(*) AS fleet,
    count(NULLIF(seascape.miss, false)) AS miss,
    count(NULLIF(seascape.lost, false)) AS lost,
    count(NULLIF(seascape.dock, false)) AS dock,
    count(NULLIF(seascape.live, false)) AS live
   FROM seascape
  GROUP BY seascape.client_id;

-- ----------------------------
--  View structure for localizations
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."localizations";
CREATE VIEW "pesca"."localizations" AS  WITH pos AS (
         SELECT seascape.esn,
            seascape.tstamp,
            seascape.lastseen,
            seascape.age,
            seascape.miss_after,
            seascape.lost_after,
            seascape.lat,
            seascape.lon,
            seascape.sog,
            seascape.head,
            seascape.input1,
            seascape.input2,
            seascape.battery_fail,
            seascape.external_power,
            seascape.vibration,
            seascape.client_id,
            seascape.client_name,
            seascape.vessel_id,
            seascape.vessel_name,
            seascape.port_id,
            seascape.service_id,
            seascape.down,
            seascape.dock,
            seascape.miss,
            seascape.lost,
            seascape.live,
            geometries.geometry_id,
            geometries.geometry_name,
            geometries.client_id,
            geometries.entities,
            geometries.dimensions,
            geometries.geometry_type,
            geometries.geom_geojson,
            geometries.geom_4326,
            st_within(st_setsrid(st_point((seascape.lon)::double precision, (seascape.lat)::double precision), 4326), geometries.geom_4326) AS inside
           FROM seascape,
            geometries
        )
 SELECT pos.esn,
    pos.geometry_id,
    pos.geometry_name,
    pos.vessel_id,
    pos.vessel_name,
    pos.port_id
   FROM pos pos(esn, tstamp, lastseen, age, miss_after, lost_after, lat, lon, sog, head, input1, input2, battery_fail, external_power, vibration, client_id, client_name, vessel_id, vessel_name, port_id, service_id, down, dock, miss, lost, live, geometry_id, geometry_name, client_id_1, entities, dimensions, geometry_type, geom_geojson, geom_4326, inside)
  WHERE pos.inside;

-- ----------------------------
--  View structure for vessel_perms
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."vessel_perms";
CREATE VIEW "pesca"."vessel_perms" AS  WITH vft AS (
         SELECT v.vessel_id,
            ft_1.fishingtype_id,
            ft_1.fishingtype_desc
           FROM vessels v,
            fishingtypes ft_1
        )
 SELECT vft.vessel_id,
    vft.fishingtype_id,
    vft.fishingtype_desc,
    (ft.id IS NOT NULL) AS value
   FROM (vft
     LEFT JOIN vessel_fishingtypes ft USING (vessel_id, fishingtype_id));

-- ----------------------------
--  View structure for vessel_checks
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."vessel_checks";
CREATE VIEW "pesca"."vessel_checks" AS  WITH vct AS (
         SELECT v.vessel_id,
            c.check_id,
            c.check_desc,
            c.check_order,
            c.check_subject
           FROM vessels v,
            checks c
          WHERE ((c.check_subject)::text = 'vessel'::text)
        )
 SELECT vct.vessel_id,
    vct.check_id,
    vct.check_desc,
    vct.check_order,
    (ct.id IS NOT NULL) AS value
   FROM (vct
     LEFT JOIN vessel_checktypes ct USING (vessel_id, check_id));

-- ----------------------------
--  View structure for client_checks
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."client_checks";
CREATE VIEW "pesca"."client_checks" AS  WITH vct AS (
         SELECT v.client_id,
            c.check_id,
            c.check_desc,
            c.check_order,
            c.check_subject
           FROM clients v,
            checks c
          WHERE ((c.check_subject)::text = 'client'::text)
        )
 SELECT vct.client_id,
    vct.check_id,
    vct.check_desc,
    vct.check_order,
    (ct.id IS NOT NULL) AS value
   FROM (vct
     LEFT JOIN client_checktypes ct USING (client_id, check_id));

-- ----------------------------
--  View structure for crossings
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."crossings";
CREATE VIEW "pesca"."crossings" AS  WITH inside AS (
         SELECT positions.position_id,
            positions.esn,
            vessels.vessel_id,
            vessels.vessel_name,
            vessels.port_id AS area_id,
            geometries.geometry_name AS area_name,
            positions.tstamp,
            st_within(st_setsrid(st_point((positions.lon)::double precision, (positions.lat)::double precision), 4326), geometries.geom_4326) AS dock
           FROM ((positions
             JOIN vessels USING (esn))
             JOIN geometries ON ((geometries.geometry_id = vessels.port_id)))
        ), events AS (
         SELECT inside.position_id,
            inside.esn,
            inside.vessel_id,
            inside.vessel_name,
            inside.area_id,
            inside.area_name,
            inside.tstamp,
            inside.dock,
            (inside.dock AND (NOT lag(inside.dock) OVER (PARTITION BY inside.esn ORDER BY inside.tstamp))) AS leaving,
            ((NOT inside.dock) AND lag(inside.dock) OVER (PARTITION BY inside.esn ORDER BY inside.tstamp)) AS entering
           FROM inside
        )
 SELECT events.position_id,
    events.esn,
    events.vessel_id,
    events.vessel_name,
    events.area_id,
    events.area_name,
    events.tstamp,
    events.dock,
    events.leaving,
    events.entering
   FROM events
  WHERE (events.leaving OR events.entering)
  ORDER BY events.esn, events.tstamp;

-- ----------------------------
--  View structure for paths
-- ----------------------------
DROP VIEW IF EXISTS "pesca"."paths";
CREATE VIEW "pesca"."paths" AS  SELECT p.position_id,
    p.esn,
    p.tstamp,
    p.lat,
    p.lon,
    p.head,
    p.sog,
    p.input1,
    p.input2,
    p.vibration,
    p.battery_fail,
    p.external_power,
    vessels.vessel_id,
    voyages.voyage_id
   FROM ((vessels
     JOIN positions p USING (esn))
     LEFT JOIN voyages USING (vessel_id))
  WHERE ((to_timestamp((p.tstamp)::double precision) >= COALESCE(voyages.atd, (now() - '30 days'::interval))) AND (to_timestamp((p.tstamp)::double precision) <= COALESCE(voyages.ata, now())))
  ORDER BY p.tstamp;


-- ----------------------------
--  Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "pesca"."alarmconditions_alarmcondition_id" RESTART 2 OWNED BY "alarmconditions"."alarmcondition_id";
ALTER SEQUENCE "pesca"."alarms_alarm_id_seq" RESTART 2 OWNED BY "alarms"."alarm_id";
ALTER SEQUENCE "pesca"."alarmtypes_alarmtype_id_seq" RESTART 2 OWNED BY "alarmtypes"."alarmtype_id";
ALTER SEQUENCE "pesca"."checks_check_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."client_checktypes_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."clients_client_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."conditions_condition_id_seq" RESTART 2 OWNED BY "conditions"."condition_id";
ALTER SEQUENCE "pesca"."fishes_fish_id_seq" RESTART 2 OWNED BY "fishes"."fish_id";
ALTER SEQUENCE "pesca"."fishingtypes_fishingtype_id_seq" RESTART 2 OWNED BY "fishingtypes"."fishingtype_id";
ALTER SEQUENCE "pesca"."geometries_geometry_id_seq" RESTART 2 OWNED BY "geometries"."geometry_id";
ALTER SEQUENCE "pesca"."journeys_journey_id_seq" RESTART 2 OWNED BY "journeys"."journey_id";
ALTER SEQUENCE "pesca"."lances_lance_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."people_person_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."ports_port_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."positions_position_id_seq1" RESTART 2 OWNED BY "positions"."position_id";
ALTER SEQUENCE "pesca"."provisions_provision_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."services_service_id_seq" RESTART 2 OWNED BY "services"."service_id";
ALTER SEQUENCE "pesca"."severities_severity_id_seq" RESTART 2 OWNED BY "severities"."severity_id";
ALTER SEQUENCE "pesca"."store_store_id_seq" RESTART 2 OWNED BY "store"."store_id";
ALTER SEQUENCE "pesca"."vessel_checks_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."vessel_fishingtypes_id_seq" RESTART 2 OWNED BY "vessel_fishingtypes"."id";
ALTER SEQUENCE "pesca"."vessel_people_id_seq" RESTART 2;
ALTER SEQUENCE "pesca"."vessels_vessel_id_seq" RESTART 2 OWNED BY "vessels"."vessel_id";
ALTER SEQUENCE "pesca"."voyages_voyage_id_seq" RESTART 2;
-- ----------------------------
--  Primary key structure for table winds
-- ----------------------------
ALTER TABLE "pesca"."winds" ADD PRIMARY KEY ("wind_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table winds
-- ----------------------------
CREATE UNIQUE INDEX  "winds_wind_id_key" ON "pesca"."winds" USING btree(wind_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table winddir
-- ----------------------------
ALTER TABLE "pesca"."winddir" ADD PRIMARY KEY ("winddir_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table winddir
-- ----------------------------
CREATE UNIQUE INDEX  "winddir_winddir_id_key" ON "pesca"."winddir" USING btree(winddir_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table alarms
-- ----------------------------
ALTER TABLE "pesca"."alarms" ADD PRIMARY KEY ("alarm_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Checks structure for table alarms
-- ----------------------------
ALTER TABLE "pesca"."alarms" ADD CONSTRAINT "alarms_weight_check" CHECK ((weight >= (0)::double precision)) NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table alarms
-- ----------------------------
CREATE UNIQUE INDEX  "alarms_alarm_id_key" ON "pesca"."alarms" USING btree(alarm_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Triggers structure for table alarms
-- ----------------------------
CREATE TRIGGER "check_alarms" AFTER INSERT OR UPDATE ON "pesca"."alarms" FOR EACH ROW EXECUTE PROCEDURE "check_alarms"();
COMMENT ON TRIGGER "check_alarms" ON "pesca"."alarms" IS NULL;

-- ----------------------------
--  Primary key structure for table alarmconditions
-- ----------------------------
ALTER TABLE "pesca"."alarmconditions" ADD PRIMARY KEY ("alarmcondition_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table alarmconditions
-- ----------------------------
CREATE UNIQUE INDEX  "alarmconditions_alarmcondition_id_key" ON "pesca"."alarmconditions" USING btree(alarmcondition_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table alarmtypes
-- ----------------------------
ALTER TABLE "pesca"."alarmtypes" ADD PRIMARY KEY ("alarmtype_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table alarmtypes
-- ----------------------------
CREATE UNIQUE INDEX  "alarmtypes_alarmtype_id_key" ON "pesca"."alarmtypes" USING btree(alarmtype_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table crew
-- ----------------------------
ALTER TABLE "pesca"."crew" ADD PRIMARY KEY ("voyage_id", "person_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table lances
-- ----------------------------
ALTER TABLE "pesca"."lances" ADD PRIMARY KEY ("lance_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Triggers structure for table lances
-- ----------------------------
CREATE TRIGGER "setLanceDate" BEFORE INSERT OR UPDATE OF "lance_start" ON "pesca"."lances" FOR EACH ROW EXECUTE PROCEDURE "setLanceDate"();
COMMENT ON TRIGGER "setLanceDate" ON "pesca"."lances" IS NULL;

-- ----------------------------
--  Primary key structure for table vessels
-- ----------------------------
ALTER TABLE "pesca"."vessels" ADD PRIMARY KEY ("vessel_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table vessels
-- ----------------------------
CREATE INDEX  "vessels_esn_key" ON "pesca"."vessels" USING btree(esn COLLATE "default" "pg_catalog"."text_ops" ASC NULLS LAST);
CREATE UNIQUE INDEX  "vessels_vessel_id_key" ON "pesca"."vessels" USING btree(vessel_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table fishes
-- ----------------------------
ALTER TABLE "pesca"."fishes" ADD PRIMARY KEY ("fish_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table fishes
-- ----------------------------
CREATE UNIQUE INDEX  "fishes_fish_id_fishtype_id_key" ON "pesca"."fishes" USING btree(fish_id "pg_catalog"."int4_ops" ASC NULLS LAST, fishingtype_id "pg_catalog"."int4_ops" ASC NULLS LAST);
CREATE UNIQUE INDEX  "fishes_fish_id_key" ON "pesca"."fishes" USING btree(fish_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table clients
-- ----------------------------
ALTER TABLE "pesca"."clients" ADD PRIMARY KEY ("client_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table clients
-- ----------------------------
CREATE UNIQUE INDEX  "clients_client_id_key" ON "pesca"."clients" USING btree(client_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Triggers structure for table clients
-- ----------------------------
CREATE TRIGGER "star_insert_client" AFTER INSERT ON "pesca"."clients" FOR EACH ROW EXECUTE PROCEDURE "star_insert_client"();
COMMENT ON TRIGGER "star_insert_client" ON "pesca"."clients" IS NULL;

-- ----------------------------
--  Primary key structure for table fishingtypes
-- ----------------------------
ALTER TABLE "pesca"."fishingtypes" ADD PRIMARY KEY ("fishingtype_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table fishingtypes
-- ----------------------------
CREATE UNIQUE INDEX  "fishingtypes_fishingtype_id_key" ON "pesca"."fishingtypes" USING btree(fishingtype_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table conditions
-- ----------------------------
ALTER TABLE "pesca"."conditions" ADD PRIMARY KEY ("condition_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table conditions
-- ----------------------------
CREATE UNIQUE INDEX  "conditions_condition_id_key" ON "pesca"."conditions" USING btree(condition_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table domains
-- ----------------------------
ALTER TABLE "pesca"."domains" ADD PRIMARY KEY ("domain_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table domains
-- ----------------------------
CREATE UNIQUE INDEX  "domains_domain_id_key" ON "pesca"."domains" USING btree(domain_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table alerts_log
-- ----------------------------
ALTER TABLE "pesca"."alerts_log" ADD PRIMARY KEY ("alarm_id", "set_at") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table alerts
-- ----------------------------
ALTER TABLE "pesca"."alerts" ADD PRIMARY KEY ("alarm_id", "set_at") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Triggers structure for table alerts
-- ----------------------------
CREATE TRIGGER "alert_ack" BEFORE UPDATE OF "ack" ON "pesca"."alerts" FOR EACH ROW EXECUTE PROCEDURE "alert_ack"();
COMMENT ON TRIGGER "alert_ack" ON "pesca"."alerts" IS NULL;

-- ----------------------------
--  Primary key structure for table addresses
-- ----------------------------
ALTER TABLE "pesca"."addresses" ADD PRIMARY KEY ("address_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table addresses
-- ----------------------------
CREATE UNIQUE INDEX  "addresses_address_id_key" ON "pesca"."addresses" USING btree(address_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table client_people_star
-- ----------------------------
ALTER TABLE "pesca"."client_people_star" ADD PRIMARY KEY ("client_id", "person_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table people
-- ----------------------------
ALTER TABLE "pesca"."people" ADD PRIMARY KEY ("person_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table people
-- ----------------------------
CREATE UNIQUE INDEX  "people_person_id_key" ON "pesca"."people" USING btree(person_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Triggers structure for table people
-- ----------------------------
CREATE TRIGGER "star_insert_people" AFTER INSERT ON "pesca"."people" FOR EACH ROW EXECUTE PROCEDURE "star_insert_people"();
COMMENT ON TRIGGER "star_insert_people" ON "pesca"."people" IS NULL;

-- ----------------------------
--  Primary key structure for table voyages
-- ----------------------------
ALTER TABLE "pesca"."voyages" ADD PRIMARY KEY ("voyage_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table voyages
-- ----------------------------
CREATE UNIQUE INDEX  "voyages_voyage_id_key" ON "pesca"."voyages" USING btree(voyage_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table severities
-- ----------------------------
ALTER TABLE "pesca"."severities" ADD PRIMARY KEY ("severity_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table severities
-- ----------------------------
CREATE UNIQUE INDEX  "severities_severity_id_key" ON "pesca"."severities" USING btree(severity_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table alarmtype_conditions
-- ----------------------------
ALTER TABLE "pesca"."alarmtype_conditions" ADD PRIMARY KEY ("alarmtype_id", "alarmcondition_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table store
-- ----------------------------
ALTER TABLE "pesca"."store" ADD PRIMARY KEY ("store_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table store
-- ----------------------------
CREATE UNIQUE INDEX  "store_store_id_key" ON "pesca"."store" USING btree(store_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table attachs
-- ----------------------------
ALTER TABLE "pesca"."attachs" ADD PRIMARY KEY ("store_id", "voyage_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table client_people
-- ----------------------------
ALTER TABLE "pesca"."client_people" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table services
-- ----------------------------
ALTER TABLE "pesca"."services" ADD PRIMARY KEY ("service_id", "start") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table services
-- ----------------------------
CREATE INDEX  "services_finish_idx" ON "pesca"."services" USING btree(finish "pg_catalog"."timestamptz_ops" ASC NULLS FIRST);

-- ----------------------------
--  Triggers structure for table services
-- ----------------------------
CREATE TRIGGER "servicing" BEFORE INSERT ON "pesca"."services" FOR EACH ROW EXECUTE PROCEDURE "servicing"();
COMMENT ON TRIGGER "servicing" ON "pesca"."services" IS NULL;

-- ----------------------------
--  Primary key structure for table checks
-- ----------------------------
ALTER TABLE "pesca"."checks" ADD PRIMARY KEY ("check_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table checks
-- ----------------------------
CREATE UNIQUE INDEX  "checks_check_id_key" ON "pesca"."checks" USING btree(check_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table geometries
-- ----------------------------
ALTER TABLE "pesca"."geometries" ADD PRIMARY KEY ("geometry_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table geometries
-- ----------------------------
CREATE UNIQUE INDEX  "geometries_geometry_id_client_id_key" ON "pesca"."geometries" USING btree(geometry_id "pg_catalog"."int4_ops" ASC NULLS LAST, client_id "pg_catalog"."int4_ops" ASC NULLS LAST);
CREATE UNIQUE INDEX  "geometries_geometry_id_key" ON "pesca"."geometries" USING btree(geometry_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Triggers structure for table geometries
-- ----------------------------
CREATE TRIGGER "check_geometries" AFTER INSERT OR UPDATE ON "pesca"."geometries" FOR EACH ROW EXECUTE PROCEDURE "check_geometries"();
COMMENT ON TRIGGER "check_geometries" ON "pesca"."geometries" IS NULL;
CREATE TRIGGER "geometry_upsert" BEFORE INSERT OR UPDATE OF "geom_geojson" ON "pesca"."geometries" FOR EACH ROW EXECUTE PROCEDURE "geometry_upsert"();
COMMENT ON TRIGGER "geometry_upsert" ON "pesca"."geometries" IS NULL;

-- ----------------------------
--  Primary key structure for table vessel_fishingtypes
-- ----------------------------
ALTER TABLE "pesca"."vessel_fishingtypes" ADD PRIMARY KEY ("vessel_id", "fishingtype_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table vessel_fishingtypes
-- ----------------------------
CREATE UNIQUE INDEX  "vessel_fishingtypes_fishingtype_id_key" ON "pesca"."vessel_fishingtypes" USING btree(fishingtype_id "pg_catalog"."int4_ops" ASC NULLS LAST, vessel_id "pg_catalog"."int4_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table vessel_checktypes
-- ----------------------------
ALTER TABLE "pesca"."vessel_checktypes" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Uniques structure for table vessel_checktypes
-- ----------------------------
ALTER TABLE "pesca"."vessel_checktypes" ADD CONSTRAINT "vessel_checks_vessel_id_check_id_key" UNIQUE ("vessel_id","check_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table client_checktypes
-- ----------------------------
ALTER TABLE "pesca"."client_checktypes" ADD PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Uniques structure for table client_checktypes
-- ----------------------------
ALTER TABLE "pesca"."client_checktypes" ADD CONSTRAINT "client_checktypes_client_id_check_id_key" UNIQUE ("client_id","check_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table provisions_smart1
-- ----------------------------
ALTER TABLE "pesca"."provisions_smart1" ADD PRIMARY KEY ("provision_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table devices
-- ----------------------------
ALTER TABLE "pesca"."devices" ADD PRIMARY KEY ("esn") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Indexes structure for table devices
-- ----------------------------
CREATE UNIQUE INDEX  "devices_esn_key" ON "pesca"."devices" USING btree(esn COLLATE "default" "pg_catalog"."text_ops" ASC NULLS LAST);

-- ----------------------------
--  Primary key structure for table positions
-- ----------------------------
ALTER TABLE "pesca"."positions" ADD PRIMARY KEY ("position_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Primary key structure for table journeys
-- ----------------------------
ALTER TABLE "pesca"."journeys" ADD PRIMARY KEY ("journey_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table alarms
-- ----------------------------
ALTER TABLE "pesca"."alarms" ADD CONSTRAINT "alarms_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "pesca"."domains" ("domain_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."alarms" ADD CONSTRAINT "alarms_severity_id_fkey" FOREIGN KEY ("severity_id") REFERENCES "pesca"."severities" ("severity_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table alarmtypes
-- ----------------------------
ALTER TABLE "pesca"."alarmtypes" ADD CONSTRAINT "alarmtypes_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "pesca"."domains" ("domain_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table crew
-- ----------------------------
ALTER TABLE "pesca"."crew" ADD CONSTRAINT "crew_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "pesca"."voyages" ("voyage_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."crew" ADD CONSTRAINT "crew_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "pesca"."people" ("person_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table lances
-- ----------------------------
ALTER TABLE "pesca"."lances" ADD CONSTRAINT "lances_fish_id_fkey" FOREIGN KEY ("fish_id") REFERENCES "pesca"."fishes" ("fish_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."lances" ADD CONSTRAINT "lances_wind_id_fkey" FOREIGN KEY ("wind_id") REFERENCES "pesca"."winds" ("wind_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."lances" ADD CONSTRAINT "lances_winddir_id_fkey" FOREIGN KEY ("winddir_id") REFERENCES "pesca"."winddir" ("winddir_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."lances" ADD CONSTRAINT "lances_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "pesca"."voyages" ("voyage_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table vessels
-- ----------------------------
ALTER TABLE "pesca"."vessels" ADD CONSTRAINT "vessels_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "pesca"."clients" ("client_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."vessels" ADD CONSTRAINT "vessels_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "pesca"."geometries" ("geometry_id") ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table fishes
-- ----------------------------
ALTER TABLE "pesca"."fishes" ADD CONSTRAINT "fishes_fishtype_id_fkey" FOREIGN KEY ("fishingtype_id") REFERENCES "pesca"."fishingtypes" ("fishingtype_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table clients
-- ----------------------------
ALTER TABLE "pesca"."clients" ADD CONSTRAINT "clients_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "pesca"."addresses" ("address_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table conditions
-- ----------------------------
ALTER TABLE "pesca"."conditions" ADD CONSTRAINT "conditions_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "pesca"."alarms" ("alarm_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."conditions" ADD CONSTRAINT "conditions_alarmcondition_id_fkey" FOREIGN KEY ("alarmcondition_id") REFERENCES "pesca"."alarmconditions" ("alarmcondition_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."conditions" ADD CONSTRAINT "conditions_alarmtype_id_fkey" FOREIGN KEY ("alarmtype_id") REFERENCES "pesca"."alarmtypes" ("alarmtype_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."conditions" ADD CONSTRAINT "conditions_geometry_id_fkey" FOREIGN KEY ("geometry_id") REFERENCES "pesca"."geometries" ("geometry_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table alerts_log
-- ----------------------------
ALTER TABLE "pesca"."alerts_log" ADD CONSTRAINT "alerts_log_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "pesca"."alarms" ("alarm_id") ON UPDATE CASCADE ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table alerts
-- ----------------------------
ALTER TABLE "pesca"."alerts" ADD CONSTRAINT "alerts_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "pesca"."alarms" ("alarm_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table client_people_star
-- ----------------------------
ALTER TABLE "pesca"."client_people_star" ADD CONSTRAINT "client_people_star_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "pesca"."clients" ("client_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."client_people_star" ADD CONSTRAINT "client_people_star_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "pesca"."people" ("person_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table people
-- ----------------------------
ALTER TABLE "pesca"."people" ADD CONSTRAINT "people_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "pesca"."addresses" ("address_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."people" ADD CONSTRAINT "people_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "pesca"."geometries" ("geometry_id") ON UPDATE NO ACTION ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table voyages
-- ----------------------------
ALTER TABLE "pesca"."voyages" ADD CONSTRAINT "voyages_target_fish_id_fkey" FOREIGN KEY ("target_fish_id", "fishingtype_id") REFERENCES "pesca"."fishes" ("fish_id", "fishingtype_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."voyages" ADD CONSTRAINT "voyages_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "pesca"."people" ("person_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."voyages" ADD CONSTRAINT "voyages_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "pesca"."vessels" ("vessel_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table alarmtype_conditions
-- ----------------------------
ALTER TABLE "pesca"."alarmtype_conditions" ADD CONSTRAINT "alarmtypeconditions_alarmcondition_id_fkey" FOREIGN KEY ("alarmcondition_id") REFERENCES "pesca"."alarmconditions" ("alarmcondition_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."alarmtype_conditions" ADD CONSTRAINT "alarmtypeconditions_alarmtype_id_fkey" FOREIGN KEY ("alarmtype_id") REFERENCES "pesca"."alarmtypes" ("alarmtype_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table attachs
-- ----------------------------
ALTER TABLE "pesca"."attachs" ADD CONSTRAINT "attachs_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "pesca"."voyages" ("voyage_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."attachs" ADD CONSTRAINT "attachs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "pesca"."store" ("store_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table client_people
-- ----------------------------
ALTER TABLE "pesca"."client_people" ADD CONSTRAINT "vessel_people_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "pesca"."people" ("person_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."client_people" ADD CONSTRAINT "vessel_people_vessel_id_fkey" FOREIGN KEY ("client_id") REFERENCES "pesca"."clients" ("client_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table services
-- ----------------------------
ALTER TABLE "pesca"."services" ADD CONSTRAINT "services_vessel_id_idx" FOREIGN KEY ("vessel_id") REFERENCES "pesca"."vessels" ("vessel_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table geometries
-- ----------------------------
ALTER TABLE "pesca"."geometries" ADD CONSTRAINT "geometries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "pesca"."clients" ("client_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table vessel_fishingtypes
-- ----------------------------
ALTER TABLE "pesca"."vessel_fishingtypes" ADD CONSTRAINT "vessel_fishingtypes_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "pesca"."vessels" ("vessel_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."vessel_fishingtypes" ADD CONSTRAINT "vessel_fishingtypes_fishingtype_id_fkey" FOREIGN KEY ("fishingtype_id") REFERENCES "pesca"."fishingtypes" ("fishingtype_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table vessel_checktypes
-- ----------------------------
ALTER TABLE "pesca"."vessel_checktypes" ADD CONSTRAINT "vessel_checks_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "pesca"."vessels" ("vessel_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."vessel_checktypes" ADD CONSTRAINT "vessel_checks_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "pesca"."checks" ("check_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table client_checktypes
-- ----------------------------
ALTER TABLE "pesca"."client_checktypes" ADD CONSTRAINT "client_checktypes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "pesca"."clients" ("client_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."client_checktypes" ADD CONSTRAINT "client_checktypes_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "pesca"."checks" ("check_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE;

-- ----------------------------
--  Foreign keys structure for table journeys
-- ----------------------------
ALTER TABLE "pesca"."journeys" ADD CONSTRAINT "journeys_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "pesca"."vessels" ("vessel_id") ON UPDATE CASCADE ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pesca"."journeys" ADD CONSTRAINT "journeys_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "pesca"."geometries" ("geometry_id") ON UPDATE CASCADE ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE;

