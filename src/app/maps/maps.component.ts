import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ActivatedRoute }   from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';
import { Subscription } from "rxjs";

import { AppService }       from '../app.service';
import { AuthService }      from '../auth/auth.service';

import { LatLonPipe       } from '../pipes/lat-lon.pipe';

import { environment } from '../../environments/environment';

import { timer } from "rxjs";

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
import OlMap from 'ol/map';
import OlView from 'ol/view';
import OlProj from 'ol/proj';

import OlSourceOSM from 'ol/source/osm';
import OlSourceVector from 'ol/source/vector';

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

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: 'maps.dialog.html',
    styleUrls: ['maps.dialog.css'],
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
    // Layers
    map: OlMap;
    OSM: OlTileLayer;
    DHN: OlTileLayer;
    Ship: OlVectorLayer;
    Path: OlVectorLayer;

    // Controls
    graticule: OlGraticule;
    pos3857:   OlMousePosition;
    pos4326:   OlMousePosition;
    select:    OlSelect;
    overlay:   OlOverlay;
    center:    OlView;
    tooltip:   HTMLElement;
    
    client_id: number;

    
    timer: Subscription;
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    constructor( public dialog: MatDialog,
                 private http: HttpClient,
                 private datepipe: DatePipe,
                 private route: ActivatedRoute,
                 private app:   AppService,
                 private auth:  AuthService,
                 private latlon: LatLonPipe ) { 
        
        this.app.setTitle('Mapa de Embarcações');
        this.center = [-42, -5, -36, 0];
                
        // Set-up Layers and Controls        
        this.pos3857 = new OlMousePosition({ projection: 'EPSG:3857', coordinateFormat: OlCoord.createStringXY(4) });
        this.pos4326 = new OlMousePosition({ projection: 'EPSG:4326', coordinateFormat: OlCoord.toStringHDMS });

        this.graticule = new OlGraticule({showLabels: true});
        this.OSM = new OlTileLayer ({ type: 'base', title: 'OpenStreetMaps', source: new OlSourceOSM() });
        
        this.DHN = new OlTileLayer ({ type: 'base', title: 'DHN Raster Charts', source: new OlSourceOSM({
            url: 'https://maps.nyxk.com.br/raster/{z}/{x}/{y}.png'
            })  
        })

        this.Ship = new OlVectorLayer ({title: 'Barcos', 
                                       style: this.styleScape.bind(this),
                                      source: new OlSourceVector()
        });

        this.Path = new OlVectorLayer ({title: 'Barcos', 
                                       style: this.styleTrack.bind(this),
                                      source: new OlSourceVector()
        });

        this.select = new OlSelect({ layers: [ this.Ship ]});
        
        this.center = new OlView({  projection: 'EPSG:4326',
//                                      extent: this.center,
                                        center: [-39.0 , -2.0],
                                          zoom: 5,
                                 });
        
        this.app.getTracks()
            .subscribe( (data) => {
                this.setTracks(data);
            });
        
        
        
        this.auth.getClient()
            .subscribe( (c) => {
                this.client_id = c.client_id;
                this.timer = timer(0, 300000).subscribe((i) => {
                    if ( !this.auth.isAuthenticated ) {
                        console.log('stopping seascape timer');
                        this.timer.unsubscribe();
                    } else {
                        this.setScape();
                    }
                });
            
            });
    }
    
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    setScape() {
        this.Ship.getSource().clear();
        this.http.get<any[]>(`${environment.baseURL}/sea/scape/${this.client_id}`)
            .subscribe((data) => {
                data.map((p) => {
                    p.geometry = new OlPoint([p.lon, p.lat], 'XY');
                    this.Ship.getSource()
                             .addFeature(new OlFeature(p));
                })
        });
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    styleScape (feature, resolution) {
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
                    
        return [
            new OlStyle ({
                image: new OlCircle({ radius: 5,
                                      fill: new OlFill({color: color}),
                                      stroke: new OlStroke({color: 'lightgray', width: 2 }) })
            }), 
            
            new OlStyle({
                text: new OlText ({
                    text:  prop.vessel_name || '***',
                    fill:  new OlFill({ color: 'black' }),
                    stroke: new OlStroke ({ color: 'lightgray', width: 3 }),
                    font: '13px sans-serif',
                    offsetY: 32
                    })
                })
            
        ];
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    setTracks(d) {
        this.Path.getSource().clear();
        const feats = d.map ( (v) => {
            this.http.get<any[]>(`${environment.baseURL}/sea/track/${v}`)
                .subscribe((data) => {
                    const coords = data.map(p => [p[1], p[2]]);
                    this.Path.getSource()
                        .addFeature(new OlFeature({
                            geometry: new OlLineString(coords, 'XY')
                        }) );
            });
        });
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    styleTrack (feature, resolution) {
        const track = [
            new OlStyle ({
                stroke: new OlStroke({  color: 'blue', 
                                        lineDash: [8, 4],
                                        width: 1 })
            }), 
        ];
        
        feature.getGeometry().forEachSegment(function(start, end) {
            track.push(new OlStyle({
                    geometry: new OlPoint(end),
                    image: new OlCircle({ radius: 3,
                                      fill: new OlFill({color: [0,0,0,0]}),
                                      stroke: new OlStroke({color: 'black', width: 1 }) })
                    }))
        })

        return track;        
    }
    
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    reset () : void {
        this.center.fit(this.center, {duration: 1500});
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    infoBox (evt) {
        this.overlay.setPosition(evt.coordinate);                

        let out='';
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, f => {            
            out = 'xxx';
        });

        this.tooltip.style.display = (out == '') ? 'none' : '';
        this.tooltip.innerHTML = out;
        
    }
    
    info ( b: boolean ) : void {
        if ( b ) {
            this.map.on('pointermove', this.infoBox, this);        
        } else {
            this.map.un('pointermove', this.infoBox, this);        
        }
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.map = new OlMap ({ target: 'map-map',
                              view: this.center,
                            layers: [
                                new OlLayerGroup({ title: 'Base Layer',   layers: [this.OSM /*, this.DHN */] }),
                                new OlLayerGroup({ title: 'Geo Local',    layers: [this.Ship, this.Path] }),
                            ],
                      interactions: OlInteraction.defaults().extend([ new OlInteractionDragRotateAndZoom(), 
                                                                        this.select ]),
                        controls: OlControl.defaults().extend([ this.pos4326,
                                                        new OlControlScaleLine(),
                                                        new OlControlZoomSlider() ]),
                });        
     
        
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
                this.app.delTrack(sel.voyage_id);
            }

            // Selecting
            if ( evt.selected[0] ) {
                const geo = evt.selected[0].getGeometry().getCoordinates();
                const sel = evt.selected[0].getProperties();

                this.overlay.setPosition(coord);
                this.app.addTrack(sel.voyage_id);

                const pos: string = this.latlon.transform(geo);
                const tag: string = this.datepipe.transform(sel.tstamp,'HH:mm dd/MMM');
                
                this.tooltip.innerHTML = `
<a class="popup-link" href="/voyages/${sel.voyage_id}">${sel.vessel_name} (${sel.esn})</a><br/>
<span class="popup-pos">${pos}</span><br/>
<small class="popup-tstamp">${tag}</small>`
            }
        };
                
        this.select.on('select', EventDialog.bind(this) ); 
    }
}