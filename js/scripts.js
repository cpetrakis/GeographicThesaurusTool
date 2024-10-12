/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var url_string = window.location.href;
var this_url = new URL(url_string);
var name = "";//this_url.searchParams.get("name");
var mmode = "geonames";//this_url.searchParams.get("mode");

var geonamesQueryUrl = "https://secure.geonames.org";
var gettyQueryUrl = "https://dev.isl.ics.forth.gr/FCdev/getty";

/*
 * Builds sparql query for Getty
 */
function sparqlQuery(locInfo) {

    var queryTable = "";

    console.log(locInfo)
    for (let variable in locInfo) {
        var json = locInfo[variable];
        var locJSON = json;

        var location = locJSON.location_name;
        if (typeof json.preferredLocationName !== "undefined" && json.preferredLocationName !== "") {//has preferred
            location = json.preferredLocationName.toLowerCase();
        }
        var broader = "";
//        var broader = locJSON.broader_name_1;
//        broader = broader.charAt(0).toUpperCase() + broader.slice(1);

        if (broader === "") {
            broader = "world";
        }
        location = location.replace(/'/g, "\\'").replace(/`/g, "\\'");
        queryTable = queryTable + "(' \"" + location + "\" ' '" + location + "' '" + broader + "')\n";
    }

    var query = "select distinct ?inputTerm ?broaderTerm ?tgnId ?tgnType ?tgnPrefLabel ?tgnParents ?tgnLat ?tgnLong {\n" +
            "  VALUES (?ftsText ?inputTerm ?broaderTerm)\n" +
            "    { \n" +
            queryTable +
            "    }\n" +
            "    VALUES(?tgnBroaderMatchingType){\n" +
            "        #'inhabited places'@en\n" +
            "       (aat:300008347) \n" +
            "       #'provinces'@en\n" +
            "       (aat:300000774)\n" +
            "       #islands\n" +
            "       (aat:300008791)\n" +
            "    }\n" +
            "  ?tgnId skos:inScheme tgn: ;\n" +
            "    #gvp:placeType|(gvp:placeType/gvp:broaderGenericExtended) ?tgnBroaderMatchingType;\n" +
            "    luc:term ?ftsText;\n" +
            "    \n" +
            "    gvp:placeTypePreferred/gvp:prefLabelGVP [xl:literalForm ?tgnType];\n" +
            "    (gvp:broaderPartitiveExtended/skosxl:prefLabel)|(gvp:broaderPartitiveExtended/skosxl:altLabel)  [xl:literalForm ?broaderTermVal];\n" +
            "    gvp:prefLabelGVP [xl:literalForm  ?tgnPrefLabel];\n" +
            "    gvp:parentString ?tgnParents;\n" +
            "    foaf:focus/wgs:lat ?tgnLat;\n" +
            "    foaf:focus/wgs:long ?tgnLong;\n" +
            "    skosxl:prefLabel|skosxl:altLabel [xl:literalForm  ?term].    \n" +
            "  \n" +
//            "  FILTER (lcase(str(?term)) = ?inputTerm).\n" +
            "  FILTER (lcase(str(?broaderTermVal)) = ?broaderTerm).  \n" +
            "}\n" +
            "order by ?inputTerm ?broaderTerm ?tgnParents\n";


//    console.log(query)

    return query;

}

function geonames(map,username) {
    $('#tgnId').parent().hide();
    var $form = $("form.editLocationPopup");
    var params = $form.serializeArray();
    var values = {};
    $.each(params, function (i, field) {
        values[field.name] = field.value;
    });
    var location = values.preferredLocationName;
    if (typeof location === "undefined" || location === null || location === "") {
        location = values.locationLabel;
    }

    location = name;

    var url = geonamesQueryUrl + "/search?q=" + encodeURIComponent(location.toLowerCase()) + "&username="+username+"&maxRows=10&style=SHORT&type=json&featureClass=A&featureClass=P&featureClass=L&featureClass=T";
//  $("#tgnId").val("");
    //  $("#coords").val("");

    //  $(".geoResults").html("");
    //  $(".gettyResults").html("");

    $.get(url, function (data) {
        console.log(url)
        console.log(data)
        var results = data.geonames;

        for (index in results) {
            var resultsBlock = "";
            var res = results[index];

            var label = "<span class='prefLabel'>" + res.name + "</span>" + " [" + res.toponymName + "] (<span class='tgnParents'>" + res.countryCode + "</span>) \n\
Lat:<span class='tgnLat'>" + res.lat + "</span> Long:<span class='tgnLong'>" + res.lng + "</span> <a target='_blank' href='https://www.geonames.org/" + res.geonameId + "'>https://www.geonames.org/" + res.geonameId + "</a>";

            var radioHtml = "<div class='radio'>" +
                    "<label>" +
                    "<input style='margin:10px;' type='radio' class='gettyRadios' name='gettyRadios' id='gettyRadios" + index + "' value='" + index + "'>" +
                    label +
                    "</label>" +
                    "</div>";
            resultsBlock = resultsBlock + radioHtml;
//            $("h4[id='" + parentsParts[1] + "']").after($(resultsBlock))
            $(".geoResults").append(resultsBlock);

        }
        if (results.length === 0) {
            resultsBlock = "No results found from Geonames!<br/>(Correct the source location name if needed and add coordinates below)";
            $(".gettyResults").html(resultsBlock);


        }
    })
            .done(function () {
                //console.log("second success");

                $(':radio[name="gettyRadios"]').click(function () {
                    var lat = $(this).parent().find('.tgnLat').html();
                    var lon = $(this).parent().find('.tgnLong').html();
                    var prefName = $(this).parent().find('.prefLabel').html();
                    var id = $(this).parent().find('a').html();
                    // console.log($(this).parent().html())
                    $('input[name=coords]').val(lat + " " + lon);
                    $('input[name=geoId]').val(id.replace('https://www.geonames.org/', ""));
                    $('input[name=other_name]').val(prefName);


                    add_marker(lat, lon, map);
                });
            })
            .fail(function () {
                console.log("Getty service error");
            })
            .always(function () {
//                console.log("finished");
            });

}

function gettyTGN(map) {

    $('#geoId').parent().hide();

    var $form = $("form.editLocationPopup");
    var params = $form.serializeArray();
    var values = {};
    $.each(params, function (i, field) {
        values[field.name] = field.value;
    });
    var locInfo = [values];

    console.log(locInfo)

    // locInfo = name;

    var query = sparqlQuery(locInfo);
    var url = gettyQueryUrl + "/sparql.json?query=" + encodeURIComponent(query) + "&_implicit=false&implicit=true&_equivalent=false&_form=%2Fsparql";
    console.log(url)
//    $("#geoId").val("");
//    $("#coords").val("");

    $(".geoResults").html("");
    $(".gettyResults").html("");
    $.get(url, function (data) {
        var results = data.results.bindings;

        for (index in results) {
            var resultsBlock = "";
            var res = results[index];
            var parents = res.tgnParents.value;
            var parentsParts = parents.split(", ");
            parentsParts.reverse();
//            for (var i = parentsParts.length - 1; i >= 0; i--) {
            for (var i = 0; i < parentsParts.length; i++) {
                var parent = parentsParts[i];
                if (i === 1) {
                    var continentHeading = "<h4 id='" + parent + "'>" + parent + "</h4>";
                    if ($(".gettyResults").children("[id='" + parent + "']").length === 0) {
                        $(".gettyResults").append(continentHeading);
                    }
                }

            }

            var label = "<span class='prefLabel'>" + res.tgnPrefLabel.value + "</span>" + " [" + res.tgnType.value + "] (<span class='tgnParents'>" + res.tgnParents.value + "</span>) \n\
Lat:<span class='tgnLat'>" + res.tgnLat.value + "</span> Long:<span class='tgnLong'>" + res.tgnLong.value + "</span> <a target='_blank' href='" + res.tgnId.value.replace(/\.edu\/tgn\//g, ".edu/page/tgn/") + "'>" + res.tgnId.value + "</a>";

            var radioHtml = "<div class='radio'>" +
                    "<label>" +
                    "<input style='margin:10px;' type='radio' class='gettyRadios' name='gettyRadios' id='gettyRadios" + index + "' value='" + index + "'>" +
                    label +
                    "</label>" +
                    "</div>";
            resultsBlock = resultsBlock + radioHtml;
            $("h4[id='" + parentsParts[1] + "']").after($(resultsBlock))


        }
        if (results.length === 0) {
            resultsBlock = "No results found from Getty!<br/>(Correct the source location name if needed and add coordinates below)";
            $(".gettyResults").html(resultsBlock);

        }
    })
            .done(function () {
//                console.log("second success");
                $(':radio[name="gettyRadios"]').click(function () {
                    var lat = $(this).parent().find('.tgnLat').html();
                    var lon = $(this).parent().find('.tgnLong').html();
                    var prefName = $(this).parent().find('.prefLabel').html();
                    var id = $(this).parent().find('a').html();
                    // console.log($(this).parent().html())
                    $('input[name=coords]').val(lat + " " + lon);
                    $('input[name=geoId]').val(id.replace('http://vocab.getty.edu/tgn/', ""));
                    $('input[name=other_name]').val(prefName);


                    add_marker(lat, lon, map);
                });

            })
            .fail(function () {
                console.log("Getty service error");
            })
            .always(function () {
//                console.log("finished");
            });


}
;

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


var marker;

function add_marker(lat, lon, map) {

    if (marker) {
        map.removeLayer(marker);
    }

    marker = new L.Marker([lat, lon], {draggable: true});
    map.addLayer(marker);
    map.flyTo([lat, lon]);
}
;

$(document).ready(function () {


    $('input[name=location_name]').val(name);

    console.log(name);
    console.log(mmode);






    $.getJSON('configuration.json', function (data) {


        var url_string = window.location.href;
        var url = new URL(url_string);
        var mode = url.searchParams.get("mode");
        var xpath = url.searchParams.get("xpath");
        var action = url.searchParams.get("action");
        var username = data.geonamesUsername;

        action = "show";
        mode = "point";

       

        $("#save_data").click(function () {
            var id = $("#geoId").val();
            var coords = $("#coords").val();
            var prefname = $("#other_name").val();
            var result = '';

            result = name + '::' + id + '::' + coords + '::' + prefname;

            var logo = xpath + 'Area';


            window.opener.document.getElementById(logo).value = result;
            window.close();
            console.log(result);

        });

        $("#cancel").click(function () {
            window.close();
        });

        $("#export_data").click(function () {
            var geoID = $("#geoId").val();
            var url = "https://secure.geonames.org/getJSON?geonameId=" + geoID + "&username="+username;
            
            $.get(url, function (data) {
                // Convert the data to a JSON string
                var jsonData = JSON.stringify(data, null, 2);  // Pretty-printed with 2 spaces
                
                // Create a Blob with the JSON data
                var blob = new Blob([jsonData], { type: "application/json" });
                
                // Create a link element to trigger the download
                var link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "geoname_" + geoID + ".json";  // Name of the file, dynamically based on geoID
                
                // Append the link, trigger the download, and remove the link
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });
        


        var init = data.init;
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
        
        if (mmode === "geonames") {
            geonames(map,username);
        } else if (mmode === "tgn") {
            gettyTGN(map);
        }

        $("#search").click(function () {
            name = ($("#location_name").val());
            $(".geoResults").empty();
            $(".gettyResults").empty();
            geonames(map,username);
        
        });
        map.spin(false);

        var lrs = new Array();

//////////////////////////////////////////////////////////////////////////////

        var southWest = L.latLng(-89.98155760646617, -180),
                northEast = L.latLng(89.99346179538875, 180);
        var bounds = L.latLngBounds(southWest, northEast);

        map.setMaxBounds(bounds);
        map.on('drag', function () {
            map.panInsideBounds(bounds, {animate: false});
        });




        var lbls = new Array();
        var ovls = new Object();

        $.each(lrs, function (i) {
            if (typeof lbls[i] !== "undefined") {
                ovls[lbls[i]] = this;
            }
        });


        L.control.layers(baseLayers, ovls).addTo(map);

        var editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);

        console.log(mode);

        var drawPluginOptions;


// Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw(drawPluginOptions);

        console.log(action)
        if (action !== 'show') {
            map.addControl(drawControl);
        }

        var editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);

        var lats = new Object();




        $('.leaflet-draw-edit-edit').click(function () {

            var logo = xpath + 'Area';
            var result = "";

            if (Object.keys(lats).length > 0) {
                if (mode === 'point') {
                    result = (lats[1].lng).toString() + ' ' + (lats[1].lat).toString();
                }

                if (result[0] === ',') {
                    result = result.substring(1);
                }
            }

            window.opener.document.getElementById(logo).value = result;
            window.close();
        });

////////////////////////////////////////////////////////////////////////////////         

        $('.leaflet-control-layers-overlays').hide();
        $('.leaflet-control-layers-separator').hide();

//////////////////////////////////////////////////////////////////////////////// 
    });
});
