/*
 To change this license header, choose License Headers in Project Properties.
 To change this template file, choose Tools | Templates
 and open the template in the editor.
 */
/* 
 Created on : Sep 19, 2019, 1:11:54 PM
 Author     : cpetrakis
 */

function isLatitude(lat) {
    return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng) {
    return isFinite(lng) && Math.abs(lng) <= 180;
}

function createBaseLayers(config_layers) {

    var result = new Object();

    $.each(config_layers, function (row) {
        if (this.id) {
            result[this.name] = L.tileLayer(this.link, {
                id: this.id,
                attribution: this.attribution
            });
        } else if (this.ext) {
            result[this.name] = L.tileLayer(this.link, {
                id: this.id,
                attribution: this.attribution,
                maxZoom: this.maxZoom,
                ext: this.ext
            });
        } else {
            result[this.name] = L.tileLayer(this.link, {
                maxZoom: this.maxZoom,
                attribution: this.attribution
            });
        }

    });

    return result;
}


function add_marker(lat, lon){
    
    var marker = L.marker([51.5, -0.09]).addTo(map);
    map.panTo([51.5, -0.09]);
    console.log('sadad')
    
};
$.getJSON('configuration.json', function (data) {

    console.log(data);
    
    var url_string = window.location.href;
    var url = new URL(url_string);
    var mode = url.searchParams.get("mode");
    var xpath = url.searchParams.get("xpath");
    var action = url.searchParams.get("action");
    
    action = "show";
    mode = "point";
   //coordinates=25.065307617187504%2035.290468565908775
    
    var coords = url.searchParams.get("coordinates");
    console.log(coords)
    
    var init = data.init;
    
    var point_geojson;
    //////////////////////////////////////MAP///////////////////////////////////////
    var baseLayers = createBaseLayers(data.baseLayers);
    var lrs = new Array();

    lrs.push(baseLayers[Object.keys(baseLayers)[0]]);


    var map = L.map('map', {
        center: [init.center.latitude, init.center.longitude],
        zoom: init.zoom,
        minZoom: init.minZoom,
        layers: lrs
    });

    map.spin(true);


   


        var url_string = window.location.href;
        var url = new URL(url_string);
        var hop = url.searchParams.get("data");

        var geojson = JSON.parse(hop);

        var qq = new Array();
        $.each(geojson, function () {
            var psit = new Object();

            psit['coordinates'] = this.coordinates;

            $.each(this.properties, function () {
                $.each(this, function (key) {
                    psit[this['label']] = this['value'];
                });

            });
            qq.push(psit);
        });
        

      
////////////////////////////////////////////
        Object.size = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key))
                    size++;
            }
            return size;
        };

        var kmls = new Object();



////////////////////////////////////////////////////////////////////////////////        


        $.each(qq, function (row) {
            if (this.coordinates) {
                kmls['Monuments_' + this.Name + '_' + this.Type ] = create_geojson(this, 'Chandler', null, null);
            }
        });


        var lrs = new Array();
        var dates = new Object();

  
//////////////////////////////////////////////////////////////////////////////
      

        var southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        var bounds = L.latLngBounds(southWest, northEast);

        map.setMaxBounds(bounds);
        map.on('drag', function () {
            map.panInsideBounds(bounds, {animate: false});
        });




        var lbls = new Array();
        $.each(kmls, function (i) {
            lbls.push(i);
        });

        var ovls = new Object();

        $.each(lrs, function (i) {
            if (typeof lbls[i] !== "undefined") {
                ovls[lbls[i]] = this;
            }
        });


        L.control.layers(baseLayers, ovls).addTo(map);
        
        

        var editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);

// define custom marker

//L.Icon.Default.prototype.options.iconUrl = 'myNewDefaultImage.png';
        var MyCustomMarker = L.Icon.extend({
            options: {
                shadowUrl: null,
             //   iconAnchor: new L.Point(10, 10),
            //    iconSize: new L.Point(30, 30),
            //    iconUrl: 'img/pin.png'
            }
        });


 console.log(mode);
 
 var drawPluginOptions ;
 

 if(mode==="point"){
     drawPluginOptions = {
            position: 'topleft',
            draw: {
                polyline: false,
                polygon: false,
                circle: false, // Turns off this drawing tool
                rectangle: false,
                marker: {
                    icon: new MyCustomMarker()
                }
            },
            edit: {
                featureGroup: editableLayers, //REQUIRED!!
                remove: false
            }
        };
     
 }
    





// Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw(drawPluginOptions);
        
         console.log(action)
 if(action!=='show'){
        map.addControl(drawControl);
 }

        var editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);

        var lats = new Object();
        var cnt = 0;
        map.on('draw:created', function (e) {
            cnt++;
            var type = e.layerType,
                    layer = e.layer;

            if (type === 'marker') {
                //  layer.bindPopup('A popup!');
            }


            if (layer._latlng) {
                lats[cnt] = layer._latlng;
                //console.log(layer._latlng)
            } else {
                // console.log(layer._latlngs)
                $.each(layer._latlngs, function (key) {
                    $.each(this, function (key) {
                        //console.log(this)
                    });
                    lats[cnt] = layer._latlngs;
                });

            }
            editableLayers.addLayer(layer);
        });



        $('.leaflet-draw-edit-edit').click(function () {

            var logo = xpath + 'Area';
            var result = "";

            if (Object.keys(lats).length > 0) {
                if (mode === 'point') {
                    result = (lats[1].lng).toString() + ' ' + (lats[1].lat).toString();
                } else if (mode === 'polygon') {
                    $.each((lats[1][0]), function (key) {
                        result = result + ',' + (this.lng).toString() + ' ' + (this.lat).toString();
                    });
                }

                //result = result + ',' + ((lats[1][0][0]).lng).toString() + ' ' + ((lats[1][0][0]).lat).toString();

                if (result[0] === ',') {
                    result = result.substring(1);
                }
            }

            window.opener.document.getElementById(logo).value = result;
            window.close();
        });

////////////////////////////////////////////////////////////////////////////////         


     


       




     //   $('#html_opt').append(option_html);
        $('.leaflet-control-layers-overlays').hide();
        $('.leaflet-control-layers-separator').hide();



        if (action === "show") {

            if (mode === "point") {
                coords = "25.065307617187504 35.290468565908775";
                var splited_coords = coords.split(" ");
              //  console.log(Object.keys(splited_coords).length)
                if (Object.keys(splited_coords).length === 2) {
                    var geojsonFeature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [parseFloat(splited_coords[0]), parseFloat(splited_coords[1])]
                        }
                    };

                   // L.geoJSON(geojsonFeature).addTo(map);
                    
                  // add_market("25.065307617187504","35.290468565908775",map);
                    // L.marker([51.5, -0.09]).addTo(map);
                   // map.panTo([parseFloat(splited_coords[1]), parseFloat(splited_coords[0])]);
                }
            }
            else {
                var splited_coords = coords.split(",");
                
                

                var cc = new Array();
                
                $.each(splited_coords, function (row) {
                    var tmp = new Array();
                    var qq = this.split(' ');
                    if (isLatitude(parseFloat(qq[0])) && isLongitude(parseFloat(qq[1]))) {

                        tmp.push(parseFloat(qq[0]));
                        tmp.push(parseFloat(qq[1]));
                    } else {
                        console.log("invalid coordinates");
                    }

                    cc.push(tmp);
                });


                var states = [{
                        "type": "Feature",
                      //  "properties": {"party": "Republican"},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [cc]
                        }
                    }];

                var polygon = L.geoJSON(states, {
                    style: function (feature) {
                        //switch (feature.properties.party) {
                        //    case 'Democrat':
                                return {color: "#0000ff"};
                       // }
                    }
                }).addTo(map);

                var bounds = polygon.getBounds();
                map.fitBounds(bounds);
                var center = bounds.getCenter();
                map.panTo(center);
            }

        }

 

      


////////////////////////////////////////////////////////////////////////////////            

        var minim = parseInt(Object.keys(dates)[0]);
        var maxim = parseInt(Object.keys(dates)[Object.keys(dates).length - 1]);

        ($("#slider").attr('min', minim));
        ($("#slider").attr('max', maxim));

   

//////////////// hop hop hop 
          // $(".ui-multiselect-none").trigger("click");
           
        $('.ui-state-default').click();
        $("#html_opt_ms").trigger("click");

        map.spin(false);

       
  
//////////////////////////////////////////////////////////////////////////////// 
});