import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute }   from '@angular/router';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { AppService }       from  '../app.service';
import { StatusService }    from  '../status/status.service';

import { Geo, Event, 
         EventGeo, 
         EventStatus, 
         EventType,
         Severity }         from  '../status/status.interfaces';

import _sortBy      from "lodash-es/sortBy";
import _debounce    from "lodash-es/debounce";
import _extend      from "lodash-es/extend";
import _filter      from "lodash-es/filter";
import _find        from "lodash-es/find";
import _pick        from "lodash-es/pick";
import _omit        from "lodash-es/omit";
import _map         from "lodash-es/map";


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
    events: Event[];
    
    constructor ( public dialogRef: MatDialogRef<MapDialog>,
                  private status: StatusService,    
                  @Inject(MAT_DIALOG_DATA) public data: any) { 
        
        this.status.getFilteredEvents(this.data)
            .subscribe( (data) => this.events = data );    
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
    DTB: OlVectorLayer;
    GEO: OlVectorLayer;
    EVT: OlVectorLayer;
    RMT: OlVectorLayer;
    
    // Contrls
    graticule: OlGraticule;
    pos3857:   OlMousePosition;
    pos4326:   OlMousePosition;
    selectGeo: OlSelect;
    selectEvt: OlSelect;
    overlay:   OlOverlay;
    center:    OlView;
    tooltip:   HTMLElement;
    
    // Filters
    colors: any;
    filter: any;
    qs: string;
    
    eventtype:   EventType;
    eventtypes:  EventType[];

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    constructor( public dialog: MatDialog,
                 private route: ActivatedRoute,
                 private status: StatusService,
                 private app:   AppService ) { 
        
        this.filter = {};
        
        // Get Filters Enumeration
        this.status.getEventTypes().subscribe(data => {
            this.eventtypes = _sortBy(data,'eventtype_order'); 
            this.eventtype = this.eventtypes[0];
            this.status.getGeoColors(this.eventtype).subscribe(data => this.colors = data);
            this.eventSetSrc();
        }); 
        
        this.status.getEventStatii().subscribe(data => {
            this.filter.fSts = null;
            this.filter.vSts = data;
        });
        
        this.status.getSeverities().subscribe(data => {
            this.filter.vSev = _sortBy(data,'severity_id');
            this.filter.fSev = null;
        });
        
        this.status.getGeo().subscribe(data => { 
            this.filter.vGeo = data;
            this.filter.fGeo = null;
        });

        this.app.setTitle('Mapa de Ocorrências');
        
        
        // Set-up Layers and Controls        
        this.pos3857 = new OlMousePosition({ projection: 'EPSG:3857', coordinateFormat: OlCoord.toStringXY   });
        this.pos4326 = new OlMousePosition({ projection: 'EPSG:4326', coordinateFormat: OlCoord.toStringHDMS });

        this.graticule = new OlGraticule();
        this.OSM = new OlTileLayer   ({ type: 'base', title: 'OpenStreetMaps', source: new OlSourceOSM() });
        this.DTB = new OlVectorLayer ({title: 'Regiões Administrativas', 
                                       style: new OlStyle ({ stroke: new OlStroke ({ color: 'blue', width: 3 }) }),
                                      source: new OlSourceVector({ format: new OlFormatGeoJSON(), 
                                                                      url: this.app.uri('/dtb/regadm') })
        });

        this.GEO = new OlVectorLayer ({title: 'Bairros', 
                                       style: this.styleGeo.bind(this),
                                      source: new OlSourceVector({ format: new OlFormatGeoJSON(), 
                                                                      url: this.app.uri('/dtb/bairro') })
        });

        this.RMT = new OlVectorLayer ({title: 'Região Metropolitana', 
                                       style: new OlStyle ({ stroke: new OlStroke ({ color: 'black', width: 5 }) }),
                                      source: new OlSourceVector({ format: new OlFormatGeoJSON(), 
                                                                      url: this.app.uri('/dtb/regmet') })
        });

        this.EVT = new OlVectorLayer ({title: 'Eventos', 
                                       style: this.styleEvt.bind(this),
        });

        this.selectGeo = new OlSelect({ layers: [ this.GEO ]});
        this.selectEvt = new OlSelect({ layers: [ this.EVT ]});
        
        this.center = new OlView({  projection: 'EPSG:3857',
                                        extent: [-4875408, -2642046, -4797763, -2601332],
                                        center: [-4835000, -2624000],
                                          zoom: 10,
                                       maxZoom: 18,
                                       minZoom: 10 });
        
    }
    
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    styleGeo (feature, resolution) {
        const color: any = _find ( this.colors, _pick(feature.getProperties(), 'geo_id') );        
        return [ 
            new OlStyle ({
                    fill:  new OlFill({ color: color.bgColor }),
                    stroke: new OlStroke ({ color: 'black', width: 2 }),
                }) 
            ];
    }

    styleEvt (feature, resolution) {
        const prop = feature.getProperties();
        const sts:any = _find (this.filter.vSts, _pick(prop,'eventstatus_id') );
        

        const image = new OlIcon({ src: `assets/map-icons/svg/ic_${sts.icon}_24px.svg` }) ;
        return [ new OlStyle({image}) ];
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    reset () : void {
        this.center.fit([-4875408, -2642046, -4797763, -2601332], {duration: 1500});
    }
    
    infoBox (evt) {
        this.overlay.setPosition(evt.coordinate);                

        let out='', geo='', dtb='', et='';
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, f => {            
            const isChild = f.get('is_child');
            if ( isChild === undefined ) {
                et = `<p><strong>Cidade: </strong>${f.get('geo_name')}</p>`;
            } else {
                if ( isChild ) {
                    geo = `<p><strong>Bairro:</strong>${f.get('geo_name')}</p>`;
                } else {
                    dtb += `<p><strong>Região:</strong>${f.get('geo_name')}</p>`;
                }
            }
        });

        out = et + geo + dtb;
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
    change (et: EventType) : void  {
        this.eventtype = et;
        this.recolor();
        this.eventSetSrc();
    }

    recolor () : void {
        this.status.getGeoColors(this.eventtype)
            .subscribe( (data) => {
                this.colors = data;
                this.GEO.setStyle ( this.styleGeo.bind(this) );
            });    
    }
    
    eventSetSrc() : void {
        const qo = { geo_id: this.filter.fGeo ? this.filter.fGeo.geo_id         : undefined,
                     evs_id: this.filter.fSts ? this.filter.fSts.eventstatus_id : undefined,
                     evt_id: this.eventtype.eventtype_id };
    
        if ( qo.geo_id && qo.evs_id )
            this.qs = `?eventtype_id=${qo.evt_id}&geo_id=${qo.geo_id}&eventstatus_id=${qo.evs_id}`;
    
        if ( qo.geo_id && !qo.evs_id )
            this.qs = `?eventtype_id=${qo.evt_id}&geo_id=${qo.geo_id}`;
    
        if ( !qo.geo_id && qo.evs_id )
            this.qs = `?eventtype_id=${qo.evt_id}&eventstatus_id=${qo.evs_id}`;
        
        if ( !qo.geo_id && !qo.evs_id )
            this.qs = `?eventtype_id=${qo.evt_id}`;
        
        this.EVT.setSource(new OlSourceVector({ format: new OlFormatGeoJSON(), 
                            url: this.app.uri('/dtb/events'+this.qs) })); 

        if ( this.filter.fGeo ) {
            this.center.fit(this.filter.fGeo.bbox, {duration: 1500});
        }
    }
    
    
    filtersChange = _debounce (this.eventSetSrc, 1000);

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.map = new OlMap ({ target: 'map-map',
                              view: this.center,
                            layers: [
                                new OlLayerGroup({ title: 'Base Layer',   layers: [this.OSM] }),
                                new OlLayerGroup({ title: 'Geo Regional', layers: [this.RMT, this.DTB] }),
                                new OlLayerGroup({ title: 'Geo Local',    layers: [this.GEO, this.EVT] }),
                            ],

                      interactions: OlInteraction.defaults().extend([ new OlInteractionDragRotateAndZoom(), 
                                                                        this.selectGeo ]),
                          controls: OlControl.defaults().extend([ this.pos3857,
                                                        new OlControlScaleLine(),
                                                        new OlControlZoomSlider() ]),
                });        
     
        
        this.tooltip = document.getElementById('feat-name');
        this.overlay = new OlOverlay({ element: this.tooltip,
                                        offset: [10, 0],
                                        positioning: 'bottom-left' });
        this.map.addOverlay(this.overlay);
        
        ///////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        const EventDialog = function(evt){
            const coord = evt.mapBrowserEvent.coordinate
            const config = { width: '50%', height: '50vh', autoFocus: false };
            
            // Deselecting
            if ( evt.deselected[0] ) {
            }

            // Selecting
            if ( evt.selected[0] ) {
                const sel = evt.selected[0].getProperties();
                const data = _extend ({}, _omit(sel, ['geometry']),
                                      this.eventtype,
                                      {eventstatii: this.filter.vSts},
                                      {severities:  this.filter.vSev});
                this.dialog
                    .open(MapDialog, _extend(config, {data}))
                    .afterClosed().subscribe(() => { 
                        this.selectGeo.getFeatures().clear();
                        this.recolor();
                        this.eventSetSrc();
                    });
            }
        };
                
        this.selectGeo.on('select', EventDialog.bind(this) ); 
    }
}