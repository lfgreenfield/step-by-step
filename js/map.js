var options = {
    center: [38.0400,-84.4650],
    zoom: 12,
    minZoom: 10
}

var map = L.map('map', options);

map.setMaxBounds(L.latLngBounds([37.77,-85.45],[38.41,-83.57]));

var tiles = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

map.addLayer(tiles); 

var sql = new cartodb.SQL({ user: 'lfgreenfield', format: 'geojson' });

sql.execute("SELECT * FROM servicedatabase").done(function(geojson) {

  makeMap(geojson);  
    
});

function makeMap(serviceDatabase){
    

    new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.Esri(),
        position: 'topright',
        zoomLevel: 15
    }).addTo(map);

    var searchbox = $('.leaflet-control-geosearch').detach().removeClass('leaflet-control').appendTo('header');


    var layerInfo = {
        abuseSupport: {name: "Abuse Counseling and Support", color: '#a6cee3'},
        residentialAbuseHelp: {name: "Residential Substance Abuse Help", color: '#1f78b4'},
        outpatientAbuseHelp: {name: "Outpatient Substance Abuse Assessment/Treatment/Support", color: '#003300'},
        emergencyShelters: {name: "Emergency Shelters", color: '#33a02c'},
        indigentHealthcare: {name: "Indigent Healthcare", color: '#fb9a99'},
        mentalHealth: {name: "Mental Health Assessment\/Counseling\/Support Groups", color: '#e31a1c'},
        clothfoodhousing: {name: "Clothing, Food, Housing, Financial Aid", color: '#fdbf6f'},
        pregnancy: {name: "Pregnancy and Parenting", color: '#ff7f00'},
        education: {name: "Education", color: '#5C5C3D'},
        childcare: {name: "Childcare", color: '#6a3d9a'},
        employment: {name: "Employment", color: '#1F1F14'},
        addtlResources: {name: "Additional Resources", color: '#b15928'}        
    }

    var geoJsonLayers = {}; 
    

    for (var layer in layerInfo) {
       
       geoJsonLayers[layer] = L.geoJson(serviceDatabase, {       

            pointToLayer: function(feature, latlng) {

                return  L.marker(latlng, {
                    icon: L.VectorMarkers.icon({
                        icon: '',
                        prefix: '',
                        //extraClasses: 'myMarker',
                        markerColor: layerInfo[layer].color,
                        iconSize: [15,20]

                      })
                }).addTo(map);

            },
            filter: function(feature) {

                if (feature.properties.servicecat == layerInfo[layer].name) {
                    return feature;

                }
            },
            onEachFeature: function(feature, layer) {
                
                var props = feature.properties;
                var content = "<b>"+props.servicenam+"</b><br>"+props.address+" "+props.city+", "+props.state+" "+props.zipcode+"<br>";

                //layer.bindPopup(content);

                layer.on('mouseover', function(e) {
                    $(".info").show();
                    updateInfo(props);
                });
                layer.on('mouseout', function(){
                    $(".info").hide(); 
                });

                },       

      }).addTo(map); 

    }
    
    console.log(serviceDatabase);

    var categoryLayers = {
        "<font color='#a6cee3'>Abuse Counseling & Support</font>": geoJsonLayers.abuseSupport,
        "<font color='#1f78b4'>Residential Substance Abuse Help</font>": geoJsonLayers.residentialAbuseHelp,
        "<font color='#003300'>Outpatient Substance Abuse Treatment & Support</font>": geoJsonLayers.outpatientAbuseHelp,
        "<font color='#33a02c'>Emergency Shelters</font>": geoJsonLayers.emergencyShelters,
        "<font color='#fb9a99'>Indigent Healthcare</font>": geoJsonLayers.indigentHealthcare,
        "<font color='#e31a1c'>Mental Health Assessment/Counseling/Support Groups</font>": geoJsonLayers.mentalHealth,
        "<font color='#fdbf6f'>Clothing, Food, Housing, Finance Aid</font>": geoJsonLayers.clothfoodhousing,
        "<font color='#ff7f00'>Pregnancy and Parenting</font>": geoJsonLayers.pregnancy,
        "<font color='#5C5C3D'>Education</font>": geoJsonLayers.education,
        "<font color='#6a3d9a'>Childcare</font>": geoJsonLayers.childcare,
        "<font color='#1F1F14'>Employment</font>": geoJsonLayers.employment,
        "<font color='#b15928'>Additional Resources</font>": geoJsonLayers.addtlResources

    }  

    L.control.layers(null, categoryLayers, {collapsed:false}).addTo(map);


    $(".leaflet-control-layers").prepend('<label><input id="show-all" type="checkbox" class="leaflet-control-layers-selector" checked=""><span>SHOW all services</span></label><label><input id="hide-all" type="checkbox" class="leaflet-control-layers-selector"><span>HIDE all services</span></label><hr>');

    $("#show-all").change(function(e){
        if(!this.checked){
         // is now unchecked
            for(var layer in geoJsonLayers) {
                map.removeLayer(geoJsonLayers[layer]);   
            }
            $(".leaflet-control-layers input").prop('checked', false);
            $("#hide-all").prop('checked', true);

        } else {
          // is now checked
            for(var layer in geoJsonLayers) {
                map.addLayer(geoJsonLayers[layer]);   
            }
            $(".leaflet-control-layers input").prop('checked', true);
            $("#hide-all").prop('checked', false);

        }
    });

    $("#hide-all").change(function(e){
        if(!this.checked){
         // is now unchecked
            for(var layer in geoJsonLayers) {
                map.addLayer(geoJsonLayers[layer]);   
            }
            $(".leaflet-control-layers input").prop('checked', true);
            $("#show-all").prop('checked', true);
            $("#hide-all").prop('checked', false);

        } else {
          // is now checked
            for(var layer in geoJsonLayers) {
                map.removeLayer(geoJsonLayers[layer]);   
            }
            $(".leaflet-control-layers input").prop('checked', false);
            $("#hide-all").prop('checked',true);

        }
    });

    function updateInfo(props) {

       var html = "<h3>"+props.servicenam+"</h3><ul>"+
                "<li>"+props.address+" "+props.City+", "+props.state+" "+
           props.zipcode+"</li>"+"<li>";

        if(props.primarypho != null){
           html+= "(p): "+props.primarypho+"</li>";
        }
        if(props.secondaryP != null){
            html+= "<li>(s): "+props.secondaryp+"</li>";
        }
        if(props.Website != null){
            html += "<li>"+props.website+"</li>"
        }

        html+= "<li>Category: "+props.servicecat+"</li>";

       $(".info").html(html);

    };


    // hide the info box on initialize
    $(".info").hide();

    $(document).mousemove(function(e){
        $(".info").css({"left": e.pageX + 8, "top": e.pageY - $(".info").height() - 8}); 
        if($(".info").offset().top < 4) {
            $(".info").css({"top": e.pageY + 8});
        }
    });
}
