/*
 To change this license header, choose License Headers in Project Properties.
 To change this template file, choose Tools | Templates
 and open the template in the editor.
 */
/* 
 Created on : Sep 19, 2019, 1:11:54 PM
 Author     : cpetrakis
 */




locationsDB.allDocs({
    include_docs: true
}).then(function (result) {
    var insts = {};
    $.each(result.rows, function () {
        if (!this.error) {
            insts = appendJSONObject(insts, this.doc.instances);
        }
    });
    var instances = insts;

    //  });

//instancesDB.get("locations").then(function (result) {

    ///////////////////////////////////////////////////////////////////////////////   
    //console.log(result)

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';



    var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr});
    var streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr});
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var OpenMapSurfer_Roads = L.tileLayer('https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 1,
        maxZoom: 16,
        ext: 'jpg'
    });

    var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
        maxZoom: 16
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    var Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 13
    });

    var baseLayers = {
        "Ocean Base Maps": Esri_OceanBasemap,
        "Grayscale": grayscale,
        "Geographical": streets,
        "Open Street Maps": osm,
        "Open Topo Maps": OpenTopoMap,
        "Esri Satellite": Esri_WorldImagery,
        "Open Map Surfer": OpenMapSurfer_Roads,
        "Stamen Watercolor": Stamen_Watercolor,
        "Esri NatGeoWorldMap": Esri_NatGeoWorldMap
    };

    var lrs = new Array();

    lrs.push(Esri_OceanBasemap);

    var map = L.map('map', {
        center: [15.73, -8.99],
        zoom: 3,
        minZoom: 2.2,
        layers: lrs
    });

    map.spin(true);

////////////////////////////////////////////////////////////////////////////////    
    // $("#successful_save").modal('show');

    all_locs = instances;//result['instances'];
   
    var locs = new Object();

    $.each(all_locs, function (key) {
        if (this.coords) {
            locs[key] = this;
        }
    });


    publicRecordsDB_remote.find({
        selector: {
            template: 'Logbook'
        },
        fields: ['_id', 'template', 'data'],
        limit: 10000
        
    }).then(function (result) {

        var kml_string = result;

        Object.size = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key))
                    size++;
            }
            return size;
        };

        var kmls = new Object();
        var ship_names = new Object();

        if (kml_string) {
            $.each(kml_string.docs, function (row) {

                if (this.data.analytic_calendars) {
                    var voyages = this.data.voyage_calendar;
                    var ship_name = this.data.ship_records.ship_name;
                    var ship_type = this.data.ship_records.ship_type;
                    var record_id = this._id;

                    ship_names[ship_name] = ship_name;

                    var calendar = this.data.analytic_calendars;

                    $.each(calendar, function (i) {
                        if (create_geojson(this)) {

                            //var date = voyages[i].duration_from;

                            var route = voyages[i].route_from + "-" + voyages[i].route_to;

                            if (voyages[i].at_port) {
                                route = voyages[i].at_port + (' (Ashore)');
                            }

                            route = route + '-' + voyages[i].duration_from + '-' + voyages[i].duration_to;
                            //console.log(voyages[i])
                            //console.log(route)
                            //console.log(i)
                            //console.log(date)

                            kmls[ship_name /*+ '_' + ship_type*/ + "_" + route.replace(/undefined/g, "??") + "_route-" + i /*+ '_' + date*/] = create_geojson(this, ship_type, ship_name, record_id);
                        }

                    });
                }
            });
        }
        //////////////////////////////////////////////////////////////////////////////////////////
        // console.log(ship_names)
        /*var hthml_btns = "";
         $.each(ship_names, function () {
         console.log(this)
         hthml_btns = hthml_btns+ "<th><button class='ui-button ui-widget ui-corner-all' >"+this+"</button></th>";
         });                  
         $('#ship_buttons').append(hthml_btns);*/

        var lrs = new Array();
        var dates = new Object();

        $.each(kmls, function (route) {

            var pp = route.split('route');
            pp = pp[0].split('_');

            var rout = pp[1].replace('_', " ");

            var rt = L.layerGroup();

            $.each(this.Document.Folder, function () {

                if (this.Point) {

                    var popup_text = "";
                    var onerror = "";

                    if (this.ship_type === "Ατμόπλοιο") {
                        onerror = 'onerror=\'this.src="../img/steamship.jpg";\'';
                    } else if (this.ship_type === "Ιστιοφόρο") {
                        onerror = 'onerror=\'this.src="../img/sailship.jpg";\'';
                    } else {
                        onerror = 'onerror=\'this.src="../img/steamship.jpg";\'';
                    }

                    if (this.ship_name) {
                        popup_text = popup_text + '<div style="overflow:hidden;"><img src="../img/' + (this.ship_name).replace(/\//g, '_') + '.jpg" style="max-height:100%;max-width:100%;"  ' + onerror + '  </img>' + '</div>';
                        popup_text = popup_text + '<div><span><b>Ship name: </b></span><span  style="color:#2a3577; font-weight:bold; font-size:13px;">' + this.ship_name + '</span></div>';
                    }
                    if (this.ship_type) {
                        popup_text = popup_text + '<div><b>Ship Type: </b> ' + this.ship_type + '</div>';
                    }
                    if (this.date) {
                        popup_text = popup_text + '<div style=" padding:5px 0px 0px 0px;"><b>Date: </b><span style="font-weight:bold; font-size:14px; color:#2a3577;">' + this.date + '</span></div>';
                    }
                    if (this.time) {
                        popup_text = popup_text + '<div><b>Time: </b><span style="font-weight:bold; font-size:14px; color:#2a3577;">' + this.time + '</span></div>';
                    }
                    if (this.calendar_location_A) {
                        popup_text = popup_text + '<div><b>Location: </b><span style="font-weight:bold; word-wrap: break-word; font-size:13px; color:#2a3577;">' + this.calendar_location_A + '</span></div>';
                    }

                    popup_text = popup_text + '<div style=" padding:0px 0px 5px 0px;"><b>Route: </b> ' + rout + '</div>';

                    if (this.weather) {
                        popup_text = popup_text + '<div>' + this.weather + '</div>';
                    }
                    if (this.wind_direction) {
                        popup_text = popup_text + '<div>' + this.wind_direction + '</div>';
                    }
                    if (this.wind_strength) {
                        popup_text = popup_text + '<div>' + this.wind_strength + '</div>';
                    }
                    if (this.ship_course) {
                        popup_text = popup_text + '<div>' + this.ship_course + '</div>';
                    }

                    ///////////////////////////////////////////////////////// 
                    if (this.calendar_miles_per_hour) {
                        popup_text = popup_text + '<div>' + this.calendar_miles_per_hour + '</div>';
                    }
                    if (this.calendar_route_value) {
                        popup_text = popup_text + '<div>' + this.calendar_route_value + '</div>';
                    }
                    if (this.good_type) {
                        popup_text = popup_text + '<div>' + this.good_type + '</div>';
                    }
                    if (this.means_of_loading) {
                        popup_text = popup_text + '<div>' + this.means_of_loading + '</div>';
                    }

                    if (this.related_person_role) {
                        var txt = this.related_person_role;
                        if (this.related_person_number) {
                            txt = txt + " " + this.related_person_number;
                        }
                        if (this.related_person_name) {
                            txt = txt + " " + this.related_person_name;
                        }
                        if (this.related_person_surname) {
                            txt = txt + " " + this.related_person_surname;
                        }
                        if (this.related_person_status_capacity) {
                            txt = txt + " " + this.related_person_status_capacity;
                        }
                        popup_text = popup_text + '<div>' + txt + '</div>';
                    }


                    if (this.encountered_ship_name) {

                        var txt = this.encountered_ship_name;

                        if (this.encountered_ship_type) {
                            txt = txt + " " + this.encountered_ship_type;
                        }
                        if (this.encountered_flag) {
                            txt = txt + " " + this.encountered_flag;
                        }

                        popup_text = popup_text + '<div>' + txt + '</div>';
                    }


                    /////////////////////////////////////////////////////////
                    /*if (this.ship_distance) {
                     popup_text = popup_text + '<div>' + this.ship_distance + '</div>';
                     }*/if (this.calendar_event_type) {
                        popup_text = popup_text + '<div>' + this.calendar_event_type + '</div>';
                    }
                    if (typeof this.event_direction !== 'undefined') {
                        popup_text = popup_text + '<div>' + this.event_direction + '</div>';
                    }


                    if (this.uncertain) {

                        if (this.uncertain) {
                            popup_text = popup_text + '<div style="padding:5px 0px 2px 0px; color:#f44336;">' + '*Comment from the historian who gave the identity information to the source location :' + this.uncertain + '</div>';
                        }
                    }

                    if (this.record_id) {
                        popup_text = popup_text + '<div style="padding:5px 0px 2px 0px;"><a style="color:#284c8e;   font-size:13px;" target="_blank" href="Logbook.html?name=' + this.record_id + '&templateTitle=Logbook&mode=teamView">' + 'View Source' + '</a></div>';
                    }


                    var icon = '../img/steamship-icon0.png';

                    if ((this.ship_type === "Ιστιοφόρο") || (this.ship_type === "Brigantino")) {
                        icon = '../img/sailship-icon.png';
                    }



                    if (this.date) {

                        var date0 = (this.date).replace("Date: ", "");
                        var pp = date0.substr(date0.length - 4);

                        if (parseInt(pp) > 1500 && parseInt(pp) < 2000) {
                            pp = parseInt(pp);
                            dates[pp] = pp;
                        }
                    }

                    var class_name = route.replace(/[^\w\s]/gi, '');
                    class_name = class_name.replace(/ /g, '_');
                    class_name = class_name.replace(/\n/g, '_');

                    if (this.coord_from_location) {
                        class_name = class_name + "_not_coord";
                    }

                    var steamship = L.icon({
                        iconUrl: icon,
                        className: class_name,
                        iconSize: [20, 20]
                    });

                    L.marker(
                            [this.Point.latitude,
                                this.Point.lontidute],
                            {icon: steamship}).bindPopup(popup_text).addTo(rt);

                    /*    var cla = class_name +' steamship';                                                   
                     if ((this.ship_type === "Ιστιοφόρο")||(this.ship_type === "Brigantino") ){
                     cla = class_name +' sailship'; 
                     }
                     
                     L.circleMarker(
                     [this.Point.latitude,
                     this.Point.lontidute], 
                     {icon: steamship, className:cla}).bindPopup(popup_text).addTo(rt);
                     */

                }
            });
            lrs.push(rt);
        });

        lrs.push(Esri_OceanBasemap);

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


////////////////////////////L.marker////////////////////////////////////      

        $(".leaflet-marker-icon").mouseover(function () {
            mouseover_color(this);
        });

        $(".leaflet-marker-icon").mouseout(function () {
            mouseout_color(this);
        });
///////////////////////////////////////////////

////////hop hop hop hop L.circleMarker///////////////////////
        /*$( ".leaflet-interactive" ).mouseover(function() {                            
         mouseover_color(this);       
         
         });
         
         $( ".leaflet-interactive" ).mouseout(function() {                
         mouseout_color(this);              
         });
         */
///////////////////////////////////////////////

        var ships = new Object();
        var routes = new Object();
        var route_dates = new Object();
        var keys = new Object();


        $.each(kmls, function (key) {

            var piou = new Object();
            piou = key.split('_');
            ships[piou[0]] = piou[0];
            routes[piou[1]] = piou[0];
            route_dates[piou[1]] = piou[3];
            keys[piou[1]] = key;


        });


        var option_html = "";

        $.each(ships, function (key) {

            option_html = option_html + '<optgroup label="' + key + '">';

            var opt = '';
            $.each(routes, function (route) {

                /*var year ;                    
                 if(route_dates[route]){
                 var tmp = route_dates[route].split('/');                          
                 year = tmp[2];
                 }*/

                var pppp = kmls[keys[route]].Document.Folder;
                var points = Object.keys(pppp).length - 1;
                if (points === 0) {
                    points = "This route has no points on map yet"
                } else if (points === 1) {
                    points = "1 point on map"
                } else {
                    points = points + " points on map"
                }



                var hop = route.split('-');
                var locs = '';
                var dates = '';
                if (hop.length === 4) {
                    locs = hop[0] + ' - ' + hop[1];
                    dates = hop[2] + ' - ' + hop[3];
                } else if (hop.length === 3) {
                    locs = hop[0];
                    dates = hop[1] + ' - ' + hop[2];
                } else if (hop.length === 8) {
                    locs = hop[0] + ' - ' + hop[1];
                    dates = hop[2] + '/' + hop[3] + '/' + hop[4] + ' - ' + hop[5] + '/' + hop[6] + '/' + hop[7];
                } else if (hop.length === 7) {
                    locs = hop[0];
                    dates = hop[1] + '/' + hop[2] + '/' + hop[3] + ' - ' + hop[4] + '/' + hop[5] + '/' + hop[6];
                } else {
                    locs = route;
                }

                if (this.toString() === key) {
                    if (route.indexOf('undefined') < 0) {
                        //console.log(route)   
                        //opt = opt +'<option value="'+key+'_'+route+'"selected="selected">'+route+' ('+year+')</option>';
                        opt = opt + '<option value="' + key + '_' + route + '"selected="selected" title="' + points + '">' + locs + ' ' + dates + '</option>';
                    }
                }
            });

            option_html = option_html + opt + '</optgroup>';


        });


        $('#html_opt').append(option_html);
        $('.leaflet-control-layers-overlays').hide();
        $('.leaflet-control-layers-separator').hide();






        $(function () {
            $("select").multiselect({
                position: {
                    my: 'left bottom',
                    at: 'left top'
                },
                click: function (event, ui) {

                    $.each($('.leaflet-control-layers').children().children('.leaflet-control-layers-overlays').children('label').children('div'), function (key) {

                        var html_layer = $(this).children('span').html();

                        if ((html_layer.indexOf(ui.value) > 0) && (ui.checked === true)) {
                            $(this).children('input').prop('checked', false);
                            $(this).children('input').click();
                        } else if ((html_layer.indexOf(ui.value) > 0) && (ui.checked === false)) {
                            $(this).children('input').prop('checked', true);
                            $(this).children('input').click();
                        }

                        $(".leaflet-marker-icon").mouseover(function () {
                            mouseover_color(this);
                        });

                        $(".leaflet-marker-icon").mouseout(function () {
                            mouseout_color(this);
                        });

                    });
                },
                /*close: function(event, ui){
                 console.log('close');
                 },
                 beforeopen: function(){
                 console.log('00');
                 },
                 open: function(){
                 
                 },
                 beforeclose: function(){
                 
                 },*/
                checkAll: function () {

                    map.spin(true);

                    setTimeout(function () {
                        map.spin(false);
                    }, 3000);


                    $.each($('.leaflet-control-layers').children().children('.leaflet-control-layers-overlays').children('label').children('div'), function (key) {
                        $(this).children('input').prop('checked', false);
                        $(this).click();
                    });

                    $(".leaflet-marker-icon").mouseover(function () {
                        mouseover_color(this);
                    });

                    $(".leaflet-marker-icon").mouseout(function () {
                        mouseout_color(this);
                    });
                },
                uncheckAll: function () {
                    $.each($('.leaflet-control-layers').children().children('.leaflet-control-layers-overlays').children('label').children('div'), function (key) {
                        $(this).children('input').prop('checked', true);
                        $(this).click();
                    });
                },
                optgrouptoggle: function (event, ui) {
                    var values = $.map(ui.inputs, function (checkbox) {
                        return checkbox.value;
                    }).join(", ");

                    var checked = values.split(', ');

                    $.each((checked), function (key) {

                        var pp = this.toString();

                        if (ui.checked === true) {

                            $.each($('.leaflet-control-layers').children().children('.leaflet-control-layers-overlays').children('label').children('div'), function (key) {

                                var html_layer = $(this).children('span').html();

                                if ((html_layer.indexOf(pp) > 0)) {
                                    $(this).children('input').prop('checked', false);
                                    $(this).children('input').click();
                                }
                            });
                        }

                        if (ui.checked === false) {
                            $.each($('.leaflet-control-layers').children().children('.leaflet-control-layers-overlays').children('label').children('div'), function (key) {

                                var html_layer = $(this).children('span').html();

                                if ((html_layer.indexOf(pp) > 0)) {
                                    $(this).children('input').prop('checked', true);
                                    $(this).children('input').click();
                                }
                            });
                        }
                    });


                    $(".leaflet-marker-icon").mouseover(function () {
                        mouseover_color(this);
                    });

                    $(".leaflet-marker-icon").mouseout(function () {
                        mouseout_color(this);
                    });
                }
            }).multiselectfilter();
        });


////////////////////////////////////////////////////////////////////////////////            

        var minim = parseInt(Object.keys(dates)[0]);
        var maxim = parseInt(Object.keys(dates)[Object.keys(dates).length - 1]);

        ($("#slider").attr('min', minim));
        ($("#slider").attr('max', maxim));

        $(function () {
            $("#slider-range").slider({
                range: true,
                min: minim,
                max: maxim,
                values: [minim, maxim],
                slide: function (event, ui) {
                    $("#amount").val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
                },
                change: function (event, ui) {

                    var selected_overlays = new Object();

                    for (var i = ui.values[0]; i <= ui.values[1]; i++) {

                        $.each(ovls, function (key) {
                            if (key.indexOf(i.toString()) > 0) {
                                selected_overlays[key] = key;
                            }
                        });
                    }

                    $.each($('.leaflet-control-layers').children().children('.leaflet-control-layers-overlays').children('label').children('div'), function (key) {

                        var html_layer = $(this).children('span').html();

                        if (selected_overlays[html_layer.trim()]) {
                            $(this).children('input').prop('checked', false);
                        } else {
                            $(this).children('input').prop('checked', true);
                        }
                        $(this).click();
                    });
                }
            });

            $("#min_date").text(minim);
            $("#max_date").text(maxim);
            $("#amount").val($("#slider-range").slider("values", 0) + " - " + $("#slider-range").slider("values", 1));

        });


//////////////// hop hop hop 
        $(".ui-multiselect-none").trigger("click");
        $("#html_opt_ms").trigger("click");
        map.spin(false);

////////////////////////////////////////////////////////////////////////////////
        function create_geojson(voyages_calendar, ship_type, ship_name, record_id) {

            var j = 0;
            var folder = new Object();

            $.each(voyages_calendar, function () {

                if ((this.calendar_location_A)) {

                    var iou = parse_location(this.calendar_location_A);
                    var string = "{'direction':'" + iou.direction.toLowerCase() + "','location_name':'" + iou.source_name.toLowerCase() + "','vernacular':'" + iou.source_name.toLowerCase() + "','type':'" + iou.location_type.toLowerCase() + "','broader_name_1':'" + iou.broad1_name.toLowerCase() + "','broader_type_1':'" + iou.broad1_type.toLowerCase() + "','broader_name_2':'" + iou.broad2_name.toLowerCase() + "','broader_type_2':'" + iou.broad2_type.toLowerCase() + "'}";

                    if (locs[string]) {
                        if (locs[string].coords) {
                            var ee = (locs[string].coords).split(' ');
                        }
                    }

                    var certain;
                    if (locs[string]) {
                        if (locs[string].uncertain) {
                            certain = locs[string].uncertain;
                        }
                    }


                }

                if (((this.calendar_langtitude) && (this.calendar_longtitude)) || ee) {

                    var lat, lon;

                    if ((this.calendar_langtitude) && (this.calendar_longtitude)) {

                        var pp = this.calendar_langtitude.split(/[^\d\w\.]+/);
                        //console.log(this.calendar_langtitude.split(/[^\d\w\.]+/))

                        if (pp.length === 3) {
                            lat = ConvertDMSToDD(pp[0], pp[1], '00', pp[2]);
                        } else if (pp.length === 4) {
                            lat = ConvertDMSToDD(pp[0], pp[1], pp[2], pp[3]);
                        }

                        var qq = this.calendar_longtitude.split(/[^\d\w\.]+/);

                        if (qq.length === 3) {
                            lon = ConvertDMSToDD(qq[0], qq[1], '00', qq[2]);
                        } else if (pp.length === 4) {
                            lon = ConvertDMSToDD(qq[0], qq[1], qq[2], qq[3]);
                        }
                    }

                    if (ee) {
                        //console.log(ee)
                        if (ee[0].indexOf('N') > 0) {

                            var pp = ee[0].split(/[^\d\w\.]+/);

                            if (pp.length === 3) {
                                lat = ConvertDMSToDD(pp[0], pp[1], '00', pp[2]);
                            } else if (pp.length === 4) {
                                lat = ConvertDMSToDD(pp[0], pp[1], pp[2], pp[3]);
                            }
                        } else {
                            lat = ee[0];
                        }

                        if (ee[0].indexOf('N') > 0) {

                            var pp = ee[0].split(/[^\d\w\.]+/);
                            if (pp.length === 3) {
                                lat = ConvertDMSToDD(pp[0], pp[1], '00', pp[2]);
                            } else if (pp.length === 4) {
                                lat = ConvertDMSToDD(pp[0], pp[1], pp[2], pp[3]);
                            }
                        } else {
                            lat = ee[0];
                        }

                        if (ee[1].indexOf('E') > 0) {

                            var pp = ee[1].split(/[^\d\w\.]+/);
                            if (pp.length === 3) {
                                lon = ConvertDMSToDD(pp[0], pp[1], '00', pp[2]);
                            } else if (pp.length === 4) {
                                lon = ConvertDMSToDD(pp[0], pp[1], pp[2], pp[3]);
                            }
                        } else {
                            lon = ee[1];
                        }


                    }


                    if ((lat) && (lon)) {


                        var description = "";
                        var point = new Object();

                        if (this.calendar_time) {
                            point['time'] = this.calendar_time;
                            description = this.calendar_time + "\n";
                        }
                        if (this.calendar_weather) {
                            point['weather'] = " <b>Weather: </b>" + this.calendar_weather;
                            description = description + "Weather:" + this.calendar_weather + "\n";
                        }
                        if (this.calendar_wind_strength) {
                            point['wind_strength'] = "<b>Wind strength: </b>" + this.calendar_wind_strength;
                            description = description + " Wind strength:" + this.calendar_wind_strength + "\n";
                        }
                        if (this.calendar_wind_direction) {
                            point['wind_direction'] = "<b>Wind direction: </b>" + this.calendar_wind_direction;
                            description = description + " Wind direction: " + this.calendar_wind_direction + "\n";
                        }
                        if (this.calendar_direction) {
                            point['ship_course'] = "<b>Course of Ship: </b>" + this.calendar_direction;
                            description = description + " Course of Ship: " + this.calendar_direction + "\n";
                        }/*if (this.distance_value) {
                         point['ship_distance'] = "Distance: " + this.distance_value;
                         description = description + " Distance: " + this.distance_value + "\n";
                         }*/
                        /////////////////////////////////////////////////////////////////
                        if (this.calendar_miles_per_hour) {
                            point['calendar_miles_per_hour'] = "<b>Speed (miles/hour): </b>" + this.calendar_miles_per_hour;
                            description = description + " Speed (miles/hour): " + this.calendar_miles_per_hour + "\n";
                        }
                        if (this.calendar_route_value) {
                            point['calendar_route_value'] = " <b>Distance from shore (miles): </b>" + this.calendar_route_value;
                            description = description + " Distance from shore (miles): " + this.calendar_route_value + "\n";
                        }
                        if (this.good_type) {
                            point['good_type'] = " <b>Good type: </b>" + this.good_type;
                            description = description + " Good type: " + this.good_type + "\n";
                        }
                        if (this.means_of_loading) {
                            point['means_of_loading'] = " <b>Means of Loading: </b>" + this.means_of_loading;
                            description = description + " Means of Loading: " + this.means_of_loading + "\n";
                        }
                        if (this.calendar_location_A) {
                            point['calendar_location_A'] = this.calendar_location_A;
                            description = description + this.calendar_location_A + "\n";
                        }
                        if (this.related_person_role) {

                            var txt = this.related_person_role;

                            if (this.related_person_number) {
                                txt = txt + " " + this.related_person_number;
                            }
                            if (this.related_person_name) {
                                txt = txt + " " + this.related_person_name;
                            }
                            if (this.related_person_surname) {
                                txt = txt + " " + this.related_person_surname;
                            }
                            if (this.related_person_status_capacity) {
                                txt = txt + " " + this.related_person_status_capacity;
                            }
                            point['related_person_role'] = " <b>Related Person: </b>" + txt;
                            description = description + " Related Person: " + txt + "\n";
                        }

                        if (this.encountered_ship_name) {
                            var txt = this.encountered_ship_name;
                            if (this.encountered_ship_type) {
                                txt = txt + " " + this.encountered_ship_type;
                            }
                            if (this.encountered_flag) {
                                txt = txt + " " + this.encountered_flag;
                            }
                            point['related_encountered_ship'] = " <b>Encountered Ship: </b>" + txt;
                            description = description + " Encountered Ship: " + txt + "\n";
                        }

                        /////////////////////////////////////////////////////////////////
                        if (this.calendar_event_type) {
                            point['calendar_event_type'] = "<b>Event type: </b>" + this.calendar_event_type;
                            description = description + " Event type: " + this.calendar_event_type + "\n";
                        }
                        if (this.calendar_event_description) {
                            point['event_direction'] = " <b>Description: </b>" + this.calendar_event_description;
                            description = description + " Description: " + this.calendar_event_description + "\n";
                        }

                        if (certain) {
                            point['uncertain'] = certain;
                            description = description + certain + "\n";
                        }



                        if (ee) {
                            point['coord_from_location'] = true;
                        }

                        var coord = new Object();




                        if ((lon.toString()).indexOf('°') < 0 && (lat.toString()).indexOf('°') < 0) {

                            if ((lat.toString()).indexOf(',') > 0) {
                                coord['latitude'] = lat.replace(/,/g, '');
                            } else {
                                coord['latitude'] = lat;
                            }

                            coord['lontidute'] = lon;//+ ',' + lat;                                                                                                                                    
                            point['Point'] = coord;

                        } else {
                            //console.log(lat +" "+ lon);
                        }



                        //console.log(coord)

                        if (this.calendar_date) {
                            point['date'] = this.calendar_date;
                        }
                        if (ship_type) {
                            point["ship_type"] = ship_type;
                        }
                        if (ship_name) {
                            point["ship_name"] = ship_name;
                        }
                        if (record_id) {
                            point["record_id"] = record_id;
                        }

                        point['description'] = description;

                        folder['Placemark_' + j] = point;

                        j++;
                    }
                }
            });

            folder['name'] = 'route';

            var document = new Object();
            document['Folder'] = folder;

            var root = new Object();
            root['Document'] = document;

            if (root) {
                //if (j > 2) {
                return root;
            } else {
                return null;
            }

        }
        ;
////////////////////////////////////////////////////////////////////////////////

        function mouseover_color(html) {

            ///////////////////////// L.Marker
            var oeo = $(html).children('class').children('context');
            var pp = $(oeo).context.classList;
            var clas = "." + pp[1];

            $(clas).css("border-radius", "50%");
            $(clas.replace('_not_coord', '')).css("border-radius", "50%");
            $(clas + '_not_coord').css("border-radius", "50%");

            if (clas.indexOf('_not_coord') > 0) {

                $(clas.replace('_not_coord', '')).css("background-color", '#f0f8ff');
                $(clas).css("background-color", "#e87b7b");
            } else {
                $(clas).css("background-color", "#f0f8ff");
                $(clas + '_not_coord').css("background-color", "#e87b7b");
            }

            /////////////// L.circleMarker//////////////////////////////////////

            //console.log(html)
            /*
             var tmp  = $(html).context.classList;    
             var cl = "."+tmp[0];
             console.log(cl);   
             
             if(cl.indexOf('_not_coord')>0){
             $(cl.replace('_not_coord','')).css("stroke", '#f0f8ff');
             $(cl).css("stroke", "#e87b7b");                                    
             }else{
             $(cl).css("stoke", "#f0f8ff"); 
             $(cl+'_not_coord').css("stoke", "#e87b7b"); 
             }
             */
            ////////////////////////////////////////////////////////////////////  
        }
        ;

////////////////////////////////////////////////////////////////////////////////

        function mouseout_color(html) {

            ////////////// L.marker ////////////////////////////////////////////////
            var oeo = $(html).children('class').children('context');
            var pp = $(oeo).context.classList;

            var clas = "." + pp[1];
            $(clas).css("background-color", "");
            $(clas + '_not_coord').css("background-color", "");
            $(clas.replace('_not_coord', '')).css("background-color", "");

            /////////////////////////////////////////////////////////////////////////

            /////////// L.circleMarker /////////////////////////////////////////////
            /*  var tmp  = $(html).context.classList;    
             var cl = "."+tmp[0];  
             
             // var oeo =$(html).children('class').children('context'); 
             // var pp = $(oeo).context.classList;
             
             var cl = "."+pp[1]; 
             // $(cl).css("stroke", "none");
             // $(cl+'_not_coord').css("stroke", "none");
             // $(cl.replace('_not_coord','')).css("stroke", "none");
             */

        }
        ;

////////////////////////////////////////////////////////////////////////////////

        function ConvertDMSToDD(degrees, minutes, seconds, direction) {

            var dd = Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60);

            if (direction === "S" || direction === "W") {
                dd = dd * -1;
            } // Don't do anything for N or E

            //console.log(dd)
            return dd;

        }
        ;

////////////////////////////////////////////////////////////////////////////////            

    });

});


//////////////////////////////////////////////////////////////////////////////// 
/*                    
 $( function() {
 $( "#accordion" )
 .accordion({
 header: "> div > h3"
 })
 .sortable({
 axis: "y",
 handle: "h3",
 stop: function( event, ui ) {
 // IE doesn't register the blur when sorting
 // so trigger focusout handlers to remove .ui-state-focus
 ui.item.children( "h3" ).triggerHandler( "focusout" );
 
 // Refresh accordion to handle new order
 $( this ).accordion( "refresh" );
 }
 });
 } );
 */
////////////////////////////////////////////////////////////////////////////////      