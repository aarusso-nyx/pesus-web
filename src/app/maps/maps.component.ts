import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

import { DatePipe } from '@angular/common';

import { ActivatedRoute }   from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';
import { Subscription } from "rxjs";

import { AppService }       from '../app.service';
import { Fish, FishingType, Client,
         Lance, Crew, Voyage,
         Person, Vessel, 
         WindDir, Wind } from '../app.interfaces';

import { AuthService }      from '../auth/auth.service';
import { ConfigService }    from '../config/config.service';
import { VoyageService }    from '../voyages/voyages.service';

import { LatLonPipe       } from '../pipes/lat-lon.pipe';

import { timer } from "rxjs";
import * as moment from "moment";

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
import OlMap from 'ol/map';
import OlView from 'ol/view';
import OlProj from 'ol/proj';

import OlSourceOSM from 'ol/source/osm';
import OlBingMaps from 'ol/source/bingmaps';
import OlSourceVector from 'ol/source/vector';
import OlSourceCluster from 'ol/source/cluster';

import OlVectorLayer from 'ol/layer/vector';
import OlTileLayer from 'ol/layer/tile';
import OlLayerGroup from 'ol/layer/group';
import OlFeature from 'ol/feature';
import OlLineString from 'ol/geom/linestring';
import OlPoint from 'ol/geom/point';

import OlFormatGeoJSON from 'ol/format/geojson';

import OlInteraction from 'ol/interaction';
import OlInteractionDragRotateAndZoom from 'ol/interaction/dragrotateandzoom';
import OlSelect from 'ol/interaction/select';

import OlCoord from 'ol/coordinate';
import OlOverlay from 'ol/overlay';
import OlGraticule from 'ol/graticule';

import OlCircle from 'ol/style/circle';
import OlStroke from 'ol/style/stroke';
import OlStyle from 'ol/style/style';
import OlFill from 'ol/style/fill';
import OlText from 'ol/style/text';
import OlIcon from 'ol/style/icon';

import OlControl from 'ol/control';
import OlControlScaleLine  from 'ol/control/scaleline';
import OlControlZoomSlider from 'ol/control/zoomslider';
import OlMousePosition from 'ol/control/mouseposition';

import _sortBy from "lodash-es/sortBy";

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
    
    timer: Subscription;
    isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);    
    
    // Enumerables
    clients: Client[];
    vessels: Vessel[];
    vessel_: Vessel[];
    
    // Authorization
    grade:   boolean = true;
    fleet:   boolean = false;
    names:   boolean = true;
    track:   boolean = true;
    
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
        });
        
        // Get all Vessels 
        this.config.vessels
            .subscribe (v => {
                this.vessel_ = _sortBy(v,['client.client_name', 'vessel_name']);
                this.vessels = this.vessel_;
        });
        
        // Set-up Layers and Controls        
        this.pos3857 = new OlMousePosition({ projection: 'EPSG:3857', coordinateFormat: OlCoord.createStringXY(4)});
        this.pos4326 = new OlMousePosition({ projection: 'EPSG:4326', coordinateFormat: OlCoord.toStringHDMS });

        this.graticule = new OlGraticule({showLabels: true});
        this.center = new OlView({  projection: 'EPSG:4326',
                                        center: [-39.0 , -2.0],
                                          zoom: 5,
                                          minZoom: 5,
                                          maxZoom: 20 });
        
        ///////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        // Setup all layers
        this.setLayers();
        
        // Subscribe to a 5min timer to refresh fleet map
        this.timer = timer(0, 300000).subscribe((i) => {
            this.Ship.getSource().getSource().clear();
            this.voy.seascape
                .subscribe((data) => {
                    data.map((p) => {
                        p.geometry = new OlPoint([p.lon, p.lat], 'XY');
                        this.Ship.getSource().getSource().addFeature(new OlFeature(p));
                        });
                });
            });
        
        // Unsubscribe on Logoff
        this.auth.logoff.subscribe(() => this.timer.unsubscribe() );
    }
    

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    ngOnInit() {
        const controls: OlControl = this.isHandset ?
              OlControl.defaults({ attribution: false, zoom: false }) : 
              OlControl.defaults().extend([ this.pos4326, 
                                            new OlControlScaleLine(),
                                            new OlControlZoomSlider() ]);
        
        this.map = new OlMap ({ view: this.center,
                              target: 'map-map',
                            controls: controls,
                              layers: [
                                new OlLayerGroup({ title: 'Base Layer', layers: [this.OSM,  this.DHN,  this.SAT ] }),
                                new OlLayerGroup({ title: 'Geo Local',  layers: [this.Ship, this.Path, this.Tags] }),
                                new OlLayerGroup({ title: 'Aux. Data',  layers: [this.Area, this.Port, this.Bath] }),
                                ],
                        interactions: OlInteraction.defaults().extend([ new OlInteractionDragRotateAndZoom(), 
                                                                        this.select ]),
                });        
     
        ///////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        this.graticule.setMap(this.map);
        
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
    public goto(p) {
        this.map.getView().setCenter(p);
        if ( p.zoom )
            this.map.getView().setZoom(p.zoom);
    }
    
    public reset() {
        this.center.fit(this.extent, {duration: 1500});
    }

    public radiusChange() {
        const src = this.Ship.getSource().getSource();
        this.Ship.setSource (new OlSourceCluster({ distance: this.cRadius, source: src }));
        this.redraw(this.Ship);
    }
    
    public tracksChange() {
        this.redraw(this.Path);
        this.redraw(this.Tags);
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
                                            url: 'https://maps.nyxk.com.br/raster/dhn/{z}/{x}/{y}.png'
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
        this.Area = new OlVectorLayer ({title: 'Areas', visible: false, 
                                       style: this.styleScape.bind(this),
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
    
    public tracks(evt) {
        this.Path.getSource().clear(true);
        this.Tags.getSource().clear(true);
        evt.source.selectedOptions.selected.map(v => {
            if ( v.selected ) {
                this.voy.getTrack(v.value.vessel_id)
                    .subscribe((data) => {
                        const coords = data.map(p => [p[1], p[2]]);
                        const feats  = data.map(p => new OlFeature({
                                t: moment.unix(p[0]).format('HH:mm'),
                                d: moment.unix(p[0]).format('DD/MMM'),
                                geometry: new OlPoint([p[1], p[2]]),
                                vel: p[3],
                                dir: p[4],
                        }));
                    
                        this.Path.getSource()
                            .addFeature(new OlFeature({
                                geometry: new OlLineString(coords, 'XY')
                            }) );
                    
                        this.Tags.getSource()
                            .addFeatures(feats);
                    });
            }
        });
    }
        

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    public filterClient(evt) {
        this.vessels = this.vessel_.filter (v => (evt.value == undefined) || v.client_id == evt.value);
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
                    
        const t_ = (new Date()).getTime();    
        const t0 = (new Date(prop.tstamp)).getTime();    
        const dt = (t_ - t0) / 1000;
        
        let color;
        if ( dt < 1800 ) {
            color = 'lime';
        } else if ( dt < 43200 ) { 
            color = 'darkorange';
        } else {
            color = 'firebrick';
        }

        const style = [
            new OlStyle ({
                image: new OlCircle({ radius: 5,
                                      fill: new OlFill({color: color}),
                                      stroke: new OlStroke({color: 'lightgray', width: 2 }) })
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
                                                                  
        return new OlStyle ({ 
            image: new OlIcon({  src: 'assets/vessel-cluster.png' }),
            text:  new OlText({ text: feature.get('features').length.toString(),
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
}

