import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, of,
         BehaviorSubject } from 'rxjs';
import { map             } from 'rxjs/operators';

import { HttpClient     }   from '@angular/common/http';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { Fish, FishingType, Client,
         Lance, Crew, Voyage,
         Person, Scape, Area,
         WindDir, Wind    } from '../app.interfaces';

import { ApiService }       from '../api.service';
import { AuthService }      from '../auth/auth.service';

import * as moment from "moment";

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
import OlMap            from 'ol/Map';
import OlView           from 'ol/View';
import OlProj           from 'ol/Proj';
import OlFeature        from 'ol/Feature';
import OlOverlay        from 'ol/Overlay';
import OlGraticule      from 'ol/Graticule';

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

import OlRegularShape   from 'ol/style/RegularShape';
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

import { toStringXY, 
         toStringHDMS } from 'ol/coordinate';

import _sortBy from "lodash-es/sortBy";
import _extend from "lodash-es/extend";
import _remove from "lodash-es/remove";
import _pull from "lodash-es/pull";
import _pick from "lodash-es/pick";

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
interface FeatureCache {
    feature:    OlFeature;
    tag:        OlFeature;
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
    sSrc: OlSourceVector;
    cSrc: OlSourceCluster;
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
    selected:  any = { range: null };
    extent:    number[] = [-71, -21, -7, 21];
    
    isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);    
    
    // Enumerables
    areas:   Area[];
    clients: Client[];
    vessels: Scape[];
    vessel_: Scape[];
    
    // Caches
    marx:    number[];
    trax:    FeatureCache[] = [];
    geos:    OlFeature[]    = [];
    base:    string;
    unit:    string;
    
    // Style parameters
    grade:   boolean = true;
    group:   boolean = true;
    fleet:   boolean = false;
    names:   boolean = true;
    track:   boolean = true;
    esnid:   boolean = false;
    
    // Cluster Radius - for SourceCluster
    cRadius: number = 40;
    
    // Style threshold
    cTracks: number = 40;
        
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    constructor( private breakpointObserver: BreakpointObserver,
                 private dialog: MatDialog,
                 private http: HttpClient,
                 private api: ApiService,
                 private auth:   AuthService) { 
        
        this.sSrc = new OlSourceVector();
        this.cSrc = new OlSourceCluster({ distance: this.cRadius, source: this.sSrc });
        
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
        // If can view all Fleet
        this.auth.can('map:all')
            .subscribe(v => {
                this.api.clients.subscribe(c => this.clients = _sortBy(c,'client_name'));
                this.api.areas.subscribe(c => this.areas = _sortBy(c,'geometry_name'));
        });
        
        // Load settings
        this.api.loadSettings()
            .subscribe(s => { 
            _extend(this, s.maps);
            
            // Setup all layers
            this.setLayers();
    
            this.cluster();
            this.api.seascape
                .subscribe((vessels) => {
                    this.sSrc.clear();
                    this.vessel_ = _sortBy(vessels.filter(v => v.service_id === null),
                                           ['client_name', 'vessel_name']);
                    this.vessels = this.vessel_;            
                    this.marx = this.vessels.map(x => x.vessel_id); 
                    this.vessels.map((p: any) => {
                        p.geometry = new OlPoint([p.lon, p.lat], 'XY');
                        this.sSrc.addFeature(new OlFeature(p));
                        });
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
        
        this.tooltip = document.getElementById('popup');
        this.overlay = new OlOverlay({ element: this.tooltip,
                                        offset: [10, 0],
                                        positioning: 'bottom-left',
                                        autoPan: true,
                                        autoPanAnimation: { duration: 250 }
        });

        this.map.addOverlay(this.overlay);


        this.baseLayers({value: this.base});
        this.coords      ({value: this.unit});        
        this.graticule.setMap ( this.grade ? this.map : null);
        ///////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        const EventDialog = function(evt){
            const coord = evt.mapBrowserEvent.coordinate;            
            
            // Deselecting
            if ( evt.deselected[0] ) {
                const sel = evt.deselected[0].getProperties();
                this.show();
                this.overlay.setPosition(undefined);
            }

            // Selecting
            if ( evt.selected[0] ) {
                const geo = evt.selected[0].getGeometry().getCoordinates();
                let props = evt.selected[0].getProperties();
                
                if ( props.features && props.features[0] ) {
                    props = props.features[0].getProperties();
                }

                this.show(props);
                this.overlay.setPosition(coord);
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

    public show(v) {
        if ( !v ) {
            this.selected = { range: null };
        } else {
            this.selected = v;
        }
    }
    
    public save() {
        const fields = ['names','esnid','fleet','group','grade','track',
                        'cRadius','cTracks','base', 'unit', 'client_id', 
                        'extent'];
        
        const s = { maps: _pick(this,fields) };
        this.api.saveSettings(s).subscribe();
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
        this.base = evt.value;
        this.save();
        
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
        this.vessels = this.vessel_.filter(v => (evt.value == undefined) || v.client_id == evt.value);
        this.save();
    }    
    
    public cluster() {
        this.Ship.setSource (this.group ? this.cSrc : this.sSrc);
        this.Ship.setStyle  (this.group ? this.styleCluster.bind(this) 
                                        : this.styleScape.bind(this));
        this.redraw(this.Ship);
    }
    
    public options(evt) {
        switch (evt.option.value) {
            case 'names':
                this.names = evt.option.selected;
                this.redraw(this.Ship);
                break;
            case 'esnid':
                this.esnid = evt.option.selected;
                this.redraw(this.Ship);
                break;
            case 'fleet':
                this.fleet = evt.option.selected;
                this.redraw(this.Ship);
                break;
            case 'group':
                this.group = evt.option.selected;
                this.cluster();
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
        
        this.save();
    }
    
    public coords(evt) {
        this.unit = evt.value;
        this.save();
        
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
    public markers (evt, v: Scape) {
        if ( evt.checked ) {
            this.marx.push(v.vessel_id);
        } else {
            _pull(this.marx, v.vessel_id);
        }
        this.redraw(this.Ship);
    }
               
    public zones (evt) {
        const id = evt.option.value.geometry_id;
        let obs: Observable<OlFeature>;

        if ( this.geos[id] === undefined ) {
            obs = this.api.getArea(id).pipe ( map(z => new OlFormatGeoJSON().readFeature(z)) );
        } else {
            obs = of(this.geos[id])
        }
                
        obs.subscribe (f => {
            if ( evt.option.selected ) {
                this.geos[id] = f;
                this.Area.getSource().addFeature(f);
            } else {
                this.Area.getSource().removeFeature(f);
            }
        });
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    public marked(v: Scape) : boolean {
        return this.marx.includes(v.vessel_id);
    }

    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    private styleScape (feature, resolution) {
        const prop = feature.getProperties()
        if ( !this.marx.some (v => v == prop.vessel_id) ) {
            return;
        }
        
        let image;
        if ( prop.down ) {
            image = new OlCircle({ radius: 5,
                                  fill: new OlFill({color: 'black'}),
                                  stroke: new OlStroke({color: 'lightgray', width: 1 }) });
        } else if ( prop.dock ) {
            if ( prop.live ) {
                image = new OlCircle({ radius1: 5,
                                      fill: new OlFill({color: 'green'}),
                                      stroke: new OlStroke({color: 'gray', width: 1 }) });
            } else if ( prop.miss ) {
                image = new OlCircle({ radius: 5,
                                      fill: new OlFill({color: 'gold'}),
                                      stroke: new OlStroke({color: 'goldenrod', width: 1 }) });
            } else if ( prop.lost ) {
                image = new OlCircle({ radius: 8,
                                      fill: new OlFill({color: 'firebrick'}),
                                      stroke: new OlStroke({color: 'red', width: 2 }) });
            }
        } else {
            if ( prop.live ) {
                image = new OlRegularShape({ radius1: 5, radius2: 2, points: 5,
                                      fill: new OlFill({color: 'green'}),
                                      stroke: new OlStroke({color: 'gray', width: 1 }) });
            } else if ( prop.miss ) {
                image = new OlRegularShape({ radius: 5, radius2: 2, points: 5,
                                      fill: new OlFill({color: 'gold'}),
                                      stroke: new OlStroke({color: 'goldenrod', width: 1 }) });
            } else if ( prop.lost ) {
                image = new OlRegularShape({ radius: 8, points: 3,
                                      fill: new OlFill({color: 'firebrick'}),
                                      stroke: new OlStroke({color: 'red', width: 2 }) });
            }            
        }
        if ( !image ) {
            console.log(prop);
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
                    color: feature.get('color'), 
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
  
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    tool ( mode: string ) {
        switch ( mode ) {
            case 'none':
                break;
            case 'select':
                break;
            case 'query':
                break;
            case 'measureLine':
                break;
            case 'measurePoly':
                break;
            case 'measureLine':
                break;
            case 'measurePoly':
                break;
            case 'edit':
                break;
            case 'remove':
                break;
            case 'move':
                break;
            case 'save':
                break;
            case 'clear':
                break;
            default:
                break;
        }
    }
    
    
    
    dropTrack(v: any) {
        console.log('delTrack', v.vessel_id);
        const t = this.trax[v.vessel_id];
        if ( !t ) {
            return;
        } else {
            this.Path.getSource().removeFeature(t.feature);
            t.tag.map ( y => this.Tags.getSource().removeFeature(y) );
        }
    }
     
    
    showTrack(v: any) {
        console.log('showTrack', v.vessel_id);
        const t = this.trax[v.vessel_id];
        if ( !t ) {
            this.getTrack(v);
        } else {
            this.Path.getSource().addFeature(t.feature);
            this.Tags.getSource().addFeatures(t.tag);
        }
    }
    
    
    changeColor(v: any) {
        console.log('changeColor', v.vessel_id);
        const t = this.trax[v.vessel_id];
        if ( !t ) {
            this.getTrack(v);
        } else {
            t.feature.set('color', v.color);
            this.dropTrack(v);
            this.showTrack(v);
        }
    }
    
    
ranges: any = {
  'Hoje': [moment(), moment()],
  'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
  'Últ. 7 Dias': [moment().subtract(6, 'days'), moment()],
  'Últ. 30 Days': [moment().subtract(29, 'days'), moment()],
  'Esse Mês': [moment().startOf('month'), moment().endOf('month')],
  'Mês Passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
}    
    
    
    changeRange(v: any) {
        this.dropTrack(v);
        this.getTrack(v);            
    }
    
    private getTrack(v: any) {
        let obs: Observable<FeatureCache>;

        const t0 = v.range.startDate.unix();
        const t1 = v.range.endDate.unix();
            
        this.api.getTrack(v.vessel_id, t0, t1)
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
                            geometry: new OlLineString(coords, 'XY'),
                            color: 'yellow'
                        }),  
                    };

                    return f;
                }) )
            .subscribe (f => {
                this.trax[v.vessel_id] = f;
                this.Path.getSource().addFeature(f.feature);
                this.Tags.getSource().addFeatures(f.tag);
            });
    }
 }