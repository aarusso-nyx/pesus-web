import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, of,
         BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { DatePipe } from '@angular/common';

import { ActivatedRoute }   from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { AppService }       from '../app.service';
import { Fish, FishingType, Client,
         Lance, Crew, Voyage,
         Person, Vessel, Area,
         WindDir, Wind } from '../app.interfaces';

import { AuthService }      from '../auth/auth.service';
import { ConfigService }    from '../config/config.service';
import { VoyageService }    from '../voyages/voyages.service';

import { LatLonPipe       } from '../pipes/lat-lon.pipe';

import * as moment from "moment";

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
import OlMap            from 'ol/Map';
import OlView           from 'ol/View';
import OlProj           from 'ol/Proj';
import OlFeature        from 'ol/Feature';
import OlOverlay        from 'ol/Overlay';
import OlGraticule      from 'ol/Graticule';

import { toStringXY, 
         toStringHDMS } from 'ol/coordinate';


import OlSourceOSM      from 'ol/source/OSM';
import OlBingMaps       from 'ol/source/BingMaps';
import OlSourceVector   from 'ol/source/Vector';
import OlSourceCluster  from 'ol/source/Cluster';

import OlVectorLayer    from 'ol/layer/Vector';
import OlTileLayer      from 'ol/layer/Tile';
import OlLayerGroup     from 'ol/layer/Group';

import OlLineString     from 'ol/geom/LineString';
import OlPoint          from 'ol/geom/Point';

import OlFormatGeoJSON  from 'ol/format/GeoJSON';

import OlInteraction    from 'ol/interaction/Interaction';
import OlSelect         from 'ol/interaction/Select';
import OlInteractionDragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';

import OlCircle         from 'ol/style/Circle';
import OlStroke         from 'ol/style/Stroke';
import OlStyle          from 'ol/style/Style';
import OlFill           from 'ol/style/Fill';
import OlText           from 'ol/style/Text';
import OlIcon           from 'ol/style/Icon';

import OlControl            from 'ol/control/Control';
import OlMousePosition      from 'ol/control/MousePosition';
import OlControlScaleLine   from 'ol/control/ScaleLine';
import OlControlZoomSlider  from 'ol/control/ZoomSlider';
import OlAttribution        from 'ol/control/Attribution';

import _sortBy from "lodash-es/sortBy";
import _extend from "lodash-es/extend";
import _remove from "lodash-es/remove";
import _pull from "lodash-es/pull";


/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
interface FeatureCache {
    feature:OlFeature;
    tag:    OlFeature;
};


/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: 'maps.dialog.html',
    styleUrls: ['maps.component.css'],
})
export class MapDialog {    
    constructor ( public dialogRef: MatDialogRef<MapDialog>,
                  @Inject(MAT_DIALOG_DATA) public data: any) { 
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './maps.component.html',
    styleUrls: ['./maps.component.css'],
})
export class MapsComponent implements OnInit {
    // Map Instance
    map: OlMap;
    
    // Base Layers
    OSM: OlTileLayer;
    DHN: OlTileLayer;
    SAT: OlTileLayer;
    
    // Vector Layers
    Ship: OlVectorLayer;
    Path: OlVectorLayer;
    Tags: OlVectorLayer;
    Area: OlVectorLayer;
    Port: OlVectorLayer;
    Bath: OlVectorLayer;
        
    // Controls
    graticule: OlGraticule;
    pos3857:   OlMousePosition;
    pos4326:   OlMousePosition;
    select:    OlSelect;
    overlay:   OlOverlay;
    center:    OlView;
    tooltip:   HTMLElement;
    extent:    number[] = [-71, -21, -7, 21];
    
    isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);    
    
    // Enumerables
    areas:   Area[];
    clients: Client[];
    vessels: Vessel[];
    vessel_: Vessel[];
    
    // Caches
    marx:    number[]       = [];
    trax:    FeatureCache[] = [];
    geos:    OlFeature[]    = [];
    
    // Style parameters
    grade:   boolean = true;
    fleet:   boolean = false;
    names:   boolean = true;
    track:   boolean = true;
    
    minRange: any;
    maxRange: any;
    
    // Cluster Radius - for SourceCluster
    cRadius: number = 40;
    
    // Style threshold
    cTracks: number = 40;
        
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    constructor( private breakpointObserver: BreakpointObserver,
                 private dialog: MatDialog,
                 private http: HttpClient,
                 private datepipe: DatePipe,
                 private route: ActivatedRoute,
                 private config: ConfigService,
                 private auth:   AuthService,
                 private app:   AppService,
                 private voy:  VoyageService,
                 private latlon: LatLonPipe ) { 

        // Set Route Title
        this.app.title = 'Mapa de Embarcações';

        // If can view all Fleet
        this.auth.can('map:all')
            .subscribe(v => {
                this.config.clients.subscribe(c => this.clients = _sortBy(c,'client_name'));
                this.config.areas.subscribe(c => this.areas = _sortBy(c,'geometry_name'));
        });
        
        // Get all Vessels 
        this.config.vessels
            .subscribe (v => {
                this.vessel_ = _sortBy(v,['client.client_name', 'vessel_name']);
                this.vessels = this.vessel_;
            
                this.marx = this.vessel_.map(x => x.vessel_id); 
        });
        
        // Set-up Layers and Controls        
        this.pos3857 = new OlMousePosition({ projection: 'EPSG:3857', coordinateFormat: toStringXY});
        this.pos4326 = new OlMousePosition({ projection: 'EPSG:4326', coordinateFormat: toStringHDMS });

        this.graticule = new OlGraticule({showLabels: true});
        this.center = new OlView({  projection: 'EPSG:4326',
                                        center: [-39.0 , -2.0],
                                          zoom: 5,
                                          minZoom: 5,
                                          maxZoom: 20 });
        
        ///////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        this.minRange = moment().toDate();
        this.maxRange = moment().subtract(30,'days').toDate();
        
        ///////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        // Setup all layers
        this.setLayers();
        this.voy.seascape
            .subscribe((data) => {
                this.Ship.getSource().getSource().clear();
                data.map((p) => {
                    p.geometry = new OlPoint([p.lon, p.lat], 'XY');
                    this.Ship.getSource().getSource().addFeature(new OlFeature(p));
                    });
            });
    }
    

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.isHandset.subscribe(mobile => {
            this.map = new OlMap ({ view: this.center,
                                  target: 'map-map',
                                  layers: [
                                    new OlLayerGroup({ title: 'Base Layer', layers: [this.OSM,  this.DHN,  this.SAT ] }),
                                    new OlLayerGroup({ title: 'Geo Local',  layers: [this.Ship, this.Path, this.Tags] }),
                                    new OlLayerGroup({ title: 'Aux. Data',  layers: [this.Area, this.Port, this.Bath] }),
                                    ],
                    });

            this.map.addInteraction(new OlInteractionDragRotateAndZoom());
            this.map.addInteraction(this.select);
            
            if ( !mobile.matches ) {
                this.map.addControl(new OlControlScaleLine());
                this.map.addControl(new OlControlZoomSlider());
            }
            
            this.map.getControls().forEach(c => {
                if ( c instanceof OlAttribution ) {
                    this.map.removeControl(c);
                }
            });
            
        })
        ///////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
//        this.graticule.setMap(this.map);
        
        this.tooltip = document.getElementById('popup');
        this.overlay = new OlOverlay({ element: this.tooltip,
                                        offset: [10, 0],
                                        positioning: 'bottom-left',
                                        autoPan: true,
                                        autoPanAnimation: { duration: 250 }
        });

        this.map.addOverlay(this.overlay);
        
        ///////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        const EventDialog = function(evt){
            const coord = evt.mapBrowserEvent.coordinate;            
            
            // Deselecting
            if ( evt.deselected[0] ) {
                const sel = evt.deselected[0].getProperties();

                this.overlay.setPosition(undefined);
            }

            // Selecting
            if ( evt.selected[0] ) {
                const geo = evt.selected[0].getGeometry().getCoordinates();
                const fts = evt.selected[0].getProperties().features;
                if (fts.length != 1) {
                    return;
                }

                const sel = fts[0].getProperties();
                
                this.overlay.setPosition(coord);

                const pos: string = this.latlon.transform(geo);
                const tag1: string = this.datepipe.transform(sel.tstamp,'dd/MMM HH:mm');
                const tag2: string = moment(sel.tstamp).fromNow();
                
                this.tooltip.innerHTML = 
                    `<span class="popup-link">${sel.vessel_name} (${sel.esn})</span><br/>
                    <span class="popup-pos">${pos}</span><br/>
                    <span class="popup-pos">Vel.: ${sel.vel || 'N/A'}${sel.vel ? ' kn' : ''}
                                            Proa: ${sel.dir || '---'}${sel.dir ? '&deg;': ''}</span><br/>
                    <small class="popup-tstamp">${tag2} em ${tag1}</small>` ;
            }
        }
                
        this.select.on('select', EventDialog.bind(this) ); 
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    public reset() {
        this.center.fit(this.extent, {duration: 1500});
    }

    public seek(v) {
        const p = [v.lon, v.lat];
        const z = this.center.getZoom() + 3;
        this.center.fit (new OlPoint(p), {maxZoom: z});
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private redraw ( l: OlVectorLayer ) {
        const src: OlSourceVector = l.getSource();
        if ( src instanceof OlSourceCluster ) {
            src.getSource().refresh();
        } else if ( src instanceof OlSourceVector ) {
            src.refresh();
        }
    }
    
    private setLayers() {
        // BaseLayers
        // OpenStreetMap
        this.OSM = new OlTileLayer ({ type: 'base', visible: true,
                                     title: 'OpenStreetMaps', 
                                    source: new OlSourceOSM() 
        });
        
        // Bing Satellite
        this.SAT = new OlTileLayer ({ type: 'base', visible: false,
                                      title: 'Bing Satellite', 
                                     source: new OlBingMaps({
                                            key: 'AgD0-yoPP7d4GG2t28K8i2HU416cn_INtH83t1voo6pCHIKAHugd2e9Q5B19ptAY',
                                            imagerySet: 'Aerial'
                                            })
        });
        
        // DHN Raster Charts
        this.DHN = new OlTileLayer ({ type: 'base', visible: false,
                                     title: 'DHN Raster Charts', 
                                    source: new OlSourceOSM({
                                            url: 'https://maps.pesus.com.br/dhn/{z}/{x}/{y}.png'
                                            })  
        });

        // Vector Layers
        // Vessel Clusters
        this.Ship = new OlVectorLayer ({title: 'Barcos', visible: true, 
                                       style: this.styleCluster.bind(this),
                                      source: new OlSourceCluster({ distance: this.cRadius, 
                                                                      source: new OlSourceVector()  })
        });

        // Vessel tracks
        this.Path = new OlVectorLayer ({title: 'Tracks', visible: true, 
                                       style: this.styleTrack.bind(this),
                                      source: new OlSourceVector()
        });

        // Vessel Time tags
        this.Tags = new OlVectorLayer ({title: 'Tstamps', visible: true, 
                                       style: this.styleTags.bind(this),
                                      source: new OlSourceVector()
        });

        // Areas
        this.Area = new OlVectorLayer ({title: 'Areas', visible: true, 
                                       style: this.styleZones.bind(this),
                                      source: new OlSourceVector()  
        });

        // Ports
        this.Port = new OlVectorLayer ({title: 'Portos', visible: false, 
                                       style: this.styleScape.bind(this),
                                      source: new OlSourceVector()  
        });

        // Bathimetry
        this.Bath = new OlVectorLayer ({title: 'Batimetria', visible: false, 
                                       style: this.styleScape.bind(this),
                                      source: new OlSourceVector()  
        });

        // Select only in Vessels layers
        this.select = new OlSelect({ layers: [this.Ship]});
    }
    
    public layers(evt) {
        switch (evt.option.value) {
            case 'fleet':
                this.Ship.setVisible(evt.option.selected);
                break;
            case 'areas':
                this.Area.setVisible(evt.option.selected);
                break;
            case 'ports':
                this.Port.setVisible(evt.option.selected);
                break;
            case 'baths':
                this.Bath.setVisible(evt.option.selected);
                break;
            default:
                break;
        }
    }
    
    public baseLayers(evt) {
        if ( evt.value == 'osm' ) {
            this.OSM.setVisible(true);
            this.SAT.setVisible(false);
            this.DHN.setVisible(false);
        } else if ( evt.value == 'sat' ) {
            this.OSM.setVisible(false);
            this.SAT.setVisible(true);
            this.DHN.setVisible(false);
        } else if ( evt.value == 'dhn' ) {
            this.OSM.setVisible(false);
            this.SAT.setVisible(false);
            this.DHN.setVisible(true);
        }
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    public filterClient(evt) {
        this.vessels = this.vessel_.filter (v => (evt.value == undefined) || v.client_id == evt.value);
    }

    public radiusChange() {
        const src = this.Ship.getSource().getSource();
        this.Ship.setSource (new OlSourceCluster({ distance: this.cRadius, source: src }));
        this.redraw(this.Ship);
    }
    
    public options(evt) {
        switch (evt.option.value) {
            case 'names':
                this.names = evt.option.selected;
                this.redraw(this.Ship);
                break;
            case 'fleet':
                this.fleet = evt.option.selected;
                this.redraw(this.Ship);
                break;
            case 'track':
                this.track = evt.option.selected;
                this.redraw(this.Path);
                this.redraw(this.Tags);
                break;
            case 'grade':
                this.grade = evt.option.selected;
                this.graticule.setMap ( this.grade ? this.map : null);
                break;
            default:
                break;
        }        
    }
    
    public coords(evt) {
        if ( evt.value == 'dms' ) {
            this.map.removeControl(this.pos3857)
            this.map.addControl(this.pos4326)
        } else if ( evt.value == 'utm' ) {
            this.map.removeControl(this.pos4326)
            this.map.addControl(this.pos3857)
        } else if ( evt.value == 'nil' ) {
            this.map.removeControl(this.pos4326)
            this.map.removeControl(this.pos3857)
        }        
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    public markers (evt, v: Vessel) {
        if ( evt.checked ) {
            this.marx.push(v.vessel_id);
        } else {
            _pull(this.marx, v.vessel_id);
        }
        this.redraw(this.Ship);
    }
    
    public tracks(evt, v: Vessel) {
        const id = v.vessel_id;
        let obs: Observable<FeatureCache>;

        if ( this.trax[id] === undefined ) {
            obs = this.voy.getTrack(v.vessel_id)
                    .pipe ( map((data) => {
                        const coords = data.map(p => [p[1], p[2]]);
                        const tag = data.map(p => new OlFeature({
                                t: moment.unix(p[0]).format('HH:mm'),
                                d: moment.unix(p[0]).format('DD/MMM'),
                                geometry: new OlPoint([p[1], p[2]]),
                                vel: p[3],
                                dir: p[4],
                        }));
                    
                        const f: FeatureCache = {
                            tag: tag,
                            feature: new OlFeature({
                                geometry: new OlLineString(coords, 'XY')
                            }),  
                        };
                
                        return f;
                    }) );
        } else {
            obs = of(this.trax[id])
        }
        
        
        obs.subscribe (f => {
            if ( evt.checked ) {
                this.trax[id] = f;
                this.Path.getSource().addFeature(f.feature);
                this.Tags.getSource().addFeatures(f.tag);
            } else {
                this.Path.getSource().removeFeature(f.feature);
                f.tag.map ( y => this.Tags.getSource().removeFeature(y) );
            }
        });
    }
           
    public zones (evt) {
        const id = evt.option.value.geometry_id;
        let obs: Observable<OlFeature>;

        if ( this.geos[id] === undefined ) {
            obs = this.voy.getZone(id).pipe ( map(z => new OlFormatGeoJSON().readFeature(z)) );
        } else {
            obs = of(this.geos[id])
        }
                
        obs.subscribe (f => {
            if ( evt.option.selected ) {
                console.log(f);
                this.geos[id] = f;
                this.Area.getSource().addFeature(f);
            } else {
                this.Area.getSource().removeFeature(f);
            }
        });
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    public marked(v: Vessel) : boolean {
        return this.marx.includes(v.vessel_id);
    }
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    public changeRange() {
        console.log(this.minRange, this.maxRange);
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private styleScape (feature, resolution) {
        const prop = feature.getProperties()
        if ( !prop.tstamp )
            return
        
        if ( !this.marx.some (v => v == prop.vessel_id) ) {
            return;
        }
            
            
        let image;
        if ( prop.lost ) {
            image = new OlCircle({ radius: 5,
                                  fill: new OlFill({color: 'lime'}),
                                  stroke: new OlStroke({color: 'lightgray', width: 2 }) });
        } else if ( prop.miss ) {
            image = new OlCircle({ radius: 8,
                                  fill: new OlFill({color: 'darkorange'}),
                                  stroke: new OlStroke({color: 'red', width: 3 }) });
        } else {
            image = new OlCircle({ radius: 5,
                                  fill: new OlFill({color: 'firebrick'}),
                                  stroke: new OlStroke({color: 'red', width: 2 }) });
        }
        
        
        const style = [
            new OlStyle ({
                image: image
            }) 
        ];
        

        if ( this.names ) {
            style.push(new OlStyle({
                text: new OlText ({
                    text:  prop.vessel_name || prop.esn,
                    fill:  new OlFill({ color: 'black' }),
                    stroke: new OlStroke ({ color: 'lightgray', width: 16 }),
                    font: '13px sans-serif',
                    offsetY: 32
                    })
                }))
        }
        
        if ( this.fleet ) {
            style.push(new OlStyle({
                text: new OlText ({
                    text:  prop.client_name,
                    fill:  new OlFill({ color: 'black' }),
                    stroke: new OlStroke ({ color: 'lightgray', width: 12 }),
                    font: '13px sans-serif',
                    offsetY: 48
                    })
                }) );    
        }
                
        return style;
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private styleCluster (feature, resolution) {
        if (feature.get('features').length == 1)
            return this.styleScape(feature.get('features')[0],resolution);
        
        const len =  feature.get('features')
                        .filter(f => this.marx.findIndex( x => { return x == f.getProperties().vessel_id }) != -1 )
                        .length.toString()
        
        return new OlStyle ({ 
            image: new OlIcon({ src: 'assets/vessel-cluster.png' }),
            text:  new OlText({text: len,
                               font: '20px sans-serif',
                             stroke: new OlStroke({ color: '#fff', width: 3 }),
                               fill: new OlFill({color: '#6EB193'    }) }) })
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private styleTrack (feature, resolution) {
        let _start = null;
        
        const track = [new OlStyle ({
                stroke: new OlStroke({ 
                    color: 'yellow', 
                 lineDash: [8, 4],
                    width: 1 })
        })];
        
        if ( this.track ) {
            const cTracks = this.cTracks;
            feature.getGeometry().forEachSegment(function(start, end) {
                if ( ! _start ) {
                    _start = [ start[0], start[1] ];
                }

                const dx = end[0] - _start[0];
                const dy = end[1] - _start[1];
                const rot = Math.atan2(dy, dx);

                if (Math.hypot(dy,dx) < cTracks*resolution) {
                    return false;
                }

                // arrows
                track.push(new OlStyle({
                        geometry: new OlPoint(end),
                        image: new OlIcon({
                            src: 'assets/arrow.png',
                            anchor: [0.75, 0.5],
                            rotateWithView: true,
                            rotation: -rot
                            })
                        }))

                _start = [end[0], end[1]];
            });
        }
        
        
        return track;        
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private last_: OlFeature = null;
    private styleTags (feature, resolution) {
        if ( !this.track ) {
            return false;
        }
            
        if ( !this.last_ ) {
            this.last_ = feature;
        }

        const last = this.last_.getProperties();
        const prop = feature.getProperties();
        const track = [];

        const p0 = this.last_.getGeometry().getCoordinates();
        const p1 =    feature.getGeometry().getCoordinates();
        
        if (Math.hypot( (p0[0]-p1[0]), (p0[1]-p1[1]) ) < this.cTracks*resolution) {
            return false;
        }
        
        track.push(new OlStyle({ text: new OlText ({
                text:  `${prop.t} \n ${(last.d == prop.d) ? '' : prop.d}`,
                fill:  new OlFill({ color: 'black' }),
                stroke: new OlStroke ({ color: 'lightgray', width: 12 }),
                font: '13px sans-serif',
                offsetX: 32,
                offsetY: 16
                })
        }));

        this.last_ = feature;
        return track;        
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private styleZones (feature, resolution) {
        const prop = feature.getProperties();
        return new OlStyle({
            stroke: new OlStroke({ color: 'blue', width: 3}),
            fill: new OlFill({color: [0.7, 0.7, 0.7, 0.3]})
        });
    }    
}

