// Creat Map object
var myMap = L.map('map', {
    center: [37.7749, -122.4194],
    zoom: 5
})

// Add tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: API_KEY
}).addTo(myMap);

// API query link for significant earthquakes in the past 30 days
var queryURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

// Get the data with d3
d3.json(queryURL, function(response) {

    // verify data in console
    console.log(response);

    // Define on each feature function to bind data to each popup
    function onEachFeature(feature, layer) {
        // assign variable to the properties of interest
        var mag = feature.properties.mag;
        var place = feature.properties.place;
        var time = Date(feature.properties.time);

        // Check if the data we care about is present
        if (mag && place) {
            layer.bindPopup(`Details:<hr>Date: ${time}<br>Magnitude: ${mag}<br>Location: ${place}`);
        }
    }

    function markerColor(mag) {
        // Make makers different sizes and colors based on magnitude
        return (
            mag < 1 ? '#43C639' :
            mag < 2 ? '#AAE4C4' :
            mag < 3 ? '#E2DEA1' :
            mag < 4 ? '#F2BF69' :
            mag < 5 ? '#FF5C24' : '#852F29'
            );
    }

    function markerSize(feature) {
        // Determine marker size based on magnitude
        mag = feature.properties.mag;
        return (mag)*3;
    }


    // Create geoJSON layer. this will automatically add the popups to the map where there have been significant earthquakes
    L.geoJson(response, {

        pointToLayer: function(feature, coord) {
            var geojsonMarkerOptions = {
                radius: markerSize(feature),
                fillColor: markerColor(feature.properties.mag),
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.75
            }
            return L.circleMarker(coord, geojsonMarkerOptions)
        },
        onEachFeature: onEachFeature
    }).addTo(myMap);

    // Create legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0,1,2,3,4,5],
            labels = [],
            lower, 
            upper;

        // create labels i.e. '1-2'
        for (var i = 0; i<magnitudes.length; i++) {
            lower = magnitudes[i];
            upper = magnitudes[i+1];

            // Add marker color and lower + upper limits to legend. On the upper bound, there's a conditional: if it's the highest value bin (it's the last item in the list), then append a '+' instead of an upper limit
            labels.push(
                `<i class="circle" style="background:${markerColor(lower)}">${lower}${upper ? '-' + upper : '+'}</i> `
            );
            console.log(labels[i]);
        };
        div.innerHTML = `<h3>Earthquake Magnitude</h3>` + labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);
});