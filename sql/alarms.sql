-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-- UPDATE alerts.ack_at time UPON alert acknowledge
CREATE FUNCTION "pesca"."alert_ack"() RETURNS "trigger" AS 
$BODY$
BEGIN
	NEW.ack_at = NOW();
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS "alert_ack" ON "pesca"."alerts";
CREATE TRIGGER "alert_ack" BEFORE UPDATE OF "ack" ON "pesca"."alerts" 
FOR EACH ROW EXECUTE PROCEDURE "alert_ack"();
COMMENT ON TRIGGER "alert_ack" ON "pesca"."alerts" IS NULL;


-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-- Check Alarms, if Alarm definition has changed
CREATE FUNCTION "pesca"."check_alarms"() RETURNS "trigger" AS 
$BODY$
BEGIN
    PERFORM pesca.check_alarm(NEW.alarm_id);
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "check_alarms" ON "celox"."alarms"; 
CREATE TRIGGER "check_alarms" AFTER INSERT OR UPDATE ON "celox"."alarms" 
FOR EACH ROW EXECUTE PROCEDURE "check_alarms"();


-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-- Check Alarms, if Geometry definitions has changed
CREATE FUNCTION "pesca"."check_geometries"() RETURNS "trigger" AS 
$BODY$
BEGIN
    PERFORM pesca.check_alarm(alarm_id) 
        FROM (SELECT DISTINCT alarm_id 
            FROM pesca.conditions 
            JOIN pesca.alarms USING (alarm_id)
            WHERE alarm_active AND geometry_id = NEW.geometry_id) _alarms;	

    RETURN NULL;
END;
$BODY$
LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS "check_geometries" ON "celox"."geometries";
CREATE TRIGGER "check_geometries" AFTER INSERT OR UPDATE ON "celox"."geometries" 
FOR EACH ROW EXECUTE PROCEDURE "check_geometries"();











-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-------------------------------------------------------------------------
-- Check ALL enabled alarms 

CREATE VIEW "celox"."status_conditions" AS  WITH base AS (
         SELECT fleet.client_id,
            cond.alarm_id,
            cond.alarmtype_id,
            cond.alarmcondition_id,
            cond.value_number,
            cond.condition_id,
            cond.geometry_id,
            cond.value_tstamp,
            als.alarmtype_desc,
            alc.alarmcondition_desc,
            alarm.alarm_desc,
            alarm.alarm_active,
            alarm.severity_id,
            alarm.entity_id,
            alarm.domain_id,
            alarm.entity_id AS vessel_id,
            alarm."TopicArn",
            fleet.vessel_name,
            st_transform(st_setsrid(st_makepoint((fleet.lon)::double precision, (fleet.lat)::double precision), 4326), 3857) AS ais_pos,
            fleet.tstamp AS ais_tstamp,
            fleet.draught AS ais_draught,
            fleet.eta AS ais_eta,
            fleet.destination AS ais_dest,
            fleet.sog AS ais_vel,
            fleet.cog AS ais_cog,
            fleet.head AS ais_head,
            geom.geom,
            geom.geometry_name
           FROM (((((conditions cond
             JOIN alarms alarm USING (alarm_id))
             JOIN alarmtypes als USING (alarmtype_id, domain_id))
             JOIN alarmconditions alc USING (alarmcondition_id))
             LEFT JOIN fleet ON (((alarm.entity_id = fleet.vessel_id) AND (alarm.domain_id = 1000))))
             LEFT JOIN geometries geom USING (client_id, geometry_id))
        ), test AS (
         SELECT base.client_id,
            base.alarm_id,
            base.alarmtype_id,
            base.alarmcondition_id,
            base.value_number,
            base.condition_id,
            base.geometry_id,
            base.value_tstamp,
            base.alarmtype_desc,
            base.alarmcondition_desc,
            base.alarm_desc,
            base.alarm_active,
            base.severity_id,
            base.entity_id,
            base.domain_id,
            base.vessel_id,
            base.vessel_name,
            base."TopicArn",
            base.ais_pos,
            base.ais_tstamp,
            base.ais_draught,
            base.ais_eta,
            base.ais_dest,
            base.ais_vel,
            base.ais_cog,
            base.ais_head,
            base.geom,
            base.geometry_name,
                CASE base.alarmtype_desc
                    WHEN 'time'::text THEN
                    CASE base.alarmcondition_desc
                        WHEN 'after'::text THEN (base.value_tstamp < now())
                        WHEN 'before'::text THEN (base.value_tstamp > now())
                        ELSE NULL::boolean
                    END
                    WHEN 'speed'::text THEN
                    CASE base.alarmcondition_desc
                        WHEN 'greater'::text THEN (base.value_number <= (base.ais_vel)::double precision)
                        WHEN 'less'::text THEN (base.value_number <= (base.ais_vel)::double precision)
                        ELSE NULL::boolean
                    END
                    WHEN 'depth'::text THEN
                    CASE base.alarmcondition_desc
                        WHEN 'greater'::text THEN (base.value_number <= (base.ais_draught)::double precision)
                        WHEN 'less'::text THEN (base.value_number <= (base.ais_draught)::double precision)
                        ELSE NULL::boolean
                    END
                    WHEN 'area'::text THEN
                    CASE base.alarmcondition_desc
                        WHEN 'inside'::text THEN st_within(base.ais_pos, base.geom)
                        WHEN 'outside'::text THEN (NOT st_within(base.ais_pos, base.geom))
                        ELSE NULL::boolean
                    END
                    WHEN 'route'::text THEN
                    CASE base.alarmcondition_desc
                        WHEN 'greater'::text THEN (base.value_number <= st_distance(base.ais_pos, base.geom))
                        WHEN 'less'::text THEN (base.value_number >= st_distance(base.ais_pos, base.geom))
                        ELSE NULL::boolean
                    END
                    WHEN 'point'::text THEN
                    CASE base.alarmcondition_desc
                        WHEN 'greater'::text THEN (base.value_number <= st_distance(base.ais_pos, base.geom))
                        WHEN 'less'::text THEN (base.value_number >= st_distance(base.ais_pos, base.geom))
                        ELSE NULL::boolean
                    END
                    WHEN 'ais'::text THEN ((base.ais_tstamp IS NULL) OR (date_part('epoch'::text, (now() - base.ais_tstamp)) >= base.value_number))
                    WHEN 'report'::text THEN ((base.ais_eta IS NULL) OR (base.ais_dest IS NULL))
                    WHEN 'load'::text THEN false
                    WHEN 'collision'::text THEN false
                    ELSE NULL::boolean
                END AS condition_status
           FROM base
        )
 SELECT test.client_id,
    test.alarm_id,
    test.alarmtype_id,
    test.alarmcondition_id,
    test.value_number,
    test.condition_id,
    test.geometry_id,
    test.value_tstamp,
    test.alarmtype_desc,
    test.alarmcondition_desc,
    test.alarm_desc,
    test.alarm_active,
    test.severity_id,
    test.entity_id,
    test.domain_id,
    test.vessel_id,
    test.vessel_name,
    test."TopicArn",
    test.ais_pos,
    test.ais_tstamp,
    test.ais_draught,
    test.ais_eta,
    test.ais_dest,
    test.ais_vel,
    test.ais_cog,
    test.ais_head,
    test.geom,
    test.geometry_name,
    test.condition_status,
        CASE
            WHEN test.condition_status THEN
            CASE test.alarmtype_desc
                WHEN 'time'::text THEN
                CASE test.alarmcondition_desc
                    WHEN 'after'::text THEN ((((test.vessel_name)::text || ' - Data Posterior a '::text) || (test.value_tstamp)::text) || '.'::text)
                    WHEN 'before'::text THEN ((((test.vessel_name)::text || ' - Data Anterior a '::text) || (test.value_tstamp)::text) || '.'::text)
                    ELSE NULL::text
                END
                WHEN 'speed'::text THEN
                CASE test.alarmcondition_desc
                    WHEN 'greater'::text THEN ((((((test.vessel_name)::text || ' navegando com velocidade superior a '::text) || to_char(test.value_number, 'FM9999D09'::text)) || 'kn ('::text) || to_char(test.ais_vel, 'FM9999D09'::text)) || 'kn).'::text)
                    WHEN 'less'::text THEN ((((((test.vessel_name)::text || ' navegando com velocidade inferior a '::text) || to_char(test.value_number, 'FM9999D09'::text)) || 'kn ('::text) || to_char(test.ais_vel, 'FM9999D09'::text)) || 'kn).'::text)
                    ELSE NULL::text
                END
                WHEN 'depth'::text THEN
                CASE test.alarmcondition_desc
                    WHEN 'greater'::text THEN ((((((test.vessel_name)::text || ' navegando com calado maior que '::text) || to_char(test.value_number, 'FM9999D09'::text)) || 'm ('::text) || to_char(test.ais_draught, 'FM9999D09'::text)) || 'm).'::text)
                    WHEN 'less'::text THEN ((((((test.vessel_name)::text || ' navegando com calado menor que '::text) || to_char(test.value_number, 'FM9999D09'::text)) || 'm ('::text) || to_char(test.ais_draught, 'FM9999D09'::text)) || 'm).'::text)
                    ELSE NULL::text
                END
                WHEN 'area'::text THEN
                CASE test.alarmcondition_desc
                    WHEN 'inside'::text THEN ((((test.vessel_name)::text || ' dentro da área «'::text) || (test.geometry_name)::text) || '».'::text)
                    WHEN 'outside'::text THEN ((((test.vessel_name)::text || ' fora da área «'::text) || (test.geometry_name)::text) || '».'::text)
                    ELSE NULL::text
                END
                WHEN 'route'::text THEN
                CASE test.alarmcondition_desc
                    WHEN 'greater'::text THEN ((((((((test.vessel_name)::text || ' afastado da rota «'::text) || (test.geometry_name)::text) || '» por mais que '::text) || test.value_number) || 'm ('::text) || to_char((st_distance(test.ais_pos, test.geom) / (1852)::double precision), 'FM9999D9'::text)) || 'nm).'::text)
                    WHEN 'less'::text THEN ((((((((test.vessel_name)::text || ' seguindo a rota «'::text) || (test.geometry_name)::text) || '» a menos que '::text) || test.value_number) || 'm ('::text) || to_char((st_distance(test.ais_pos, test.geom) / (1852)::double precision), 'FM9999D9'::text)) || 'nm).'::text)
                    ELSE NULL::text
                END
                WHEN 'point'::text THEN
                CASE test.alarmcondition_desc
                    WHEN 'greater'::text THEN ((((((((test.vessel_name)::text || ' distante do ponto «'::text) || (test.geometry_name)::text) || '» mais que '::text) || test.value_number) || 'm ('::text) || to_char((st_distance(test.ais_pos, test.geom) / (1852)::double precision), 'FM9999D9'::text)) || 'nm).'::text)
                    WHEN 'less'::text THEN ((((((((test.vessel_name)::text || ' distante do ponto «'::text) || (test.geometry_name)::text) || '» menos que '::text) || test.value_number) || 'm ('::text) || to_char((st_distance(test.ais_pos, test.geom) / (1852)::double precision), 'FM9999D9'::text)) || 'nm).'::text)
                    ELSE NULL::text
                END
                WHEN 'ais'::text THEN
                CASE
                    WHEN (test.ais_tstamp IS NULL) THEN ((test.vessel_name)::text || ' - Sem sinal AIS.'::text)
                    ELSE ((((test.vessel_name)::text || ' - Última mensagem AIS a '::text) || age(test.ais_tstamp, now())) || '.'::text)
                END
                WHEN 'report'::text THEN ((test.vessel_name)::text || ' - Mensagem AIS incompleta (Viagem, Calado ou ETA).'::text)
                WHEN 'load'::text THEN ((test.vessel_name)::text || ' - Em Operação de Carga.'::text)
                WHEN 'collision'::text THEN ((test.vessel_name)::text || ' - Risco de colisão iminente.'::text)
                ELSE NULL::text
            END
            ELSE NULL::text
        END AS condition_message
   FROM test;


CREATE FUNCTION "pesca"."check_alarm"(IN _alarm_id int4) RETURNS "int4" AS 
$BODY$
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
         position_id,
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
        position_id,
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