// Function to create the welcome dialog box
function createWelcomeDialog() {
    // Create the dialog box container
    var dialog = document.createElement('div');
    dialog.id = 'welcome-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = '#1a1a1a';
    dialog.style.color = 'white';
    dialog.style.borderRadius = '10px';
    dialog.style.border = '3px solid #8a8a8a';
    dialog.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.2)';
    dialog.style.zIndex = '1000';
    dialog.style.width = '300px';
    dialog.style.textAlign = 'center';

    // Create the header
    var header = document.createElement('div');
    header.style.borderBottom = '1px solid #515151';
    header.style.paddingTop = '10px';
    header.style.paddingBottom = '10px';
    var headerTitle = document.createElement('h3');
    headerTitle.innerText = 'Salzburg Amenities Near Me';
    headerTitle.style.margin = '0';
    var subtitle = document.createElement('p');
    subtitle.innerHTML = 'by <a href="https://bamideleoke.dev" target="_blank" style="color: #007bff; text-decoration: none;">Bamidele Clement Oke</a>';
    subtitle.style.margin = '0';
    subtitle.style.fontSize = '0.9rem';

    // Append the title and subtitle to the header
    header.appendChild(headerTitle);
    header.appendChild(subtitle);

    // Create the body
    var body = document.createElement('div');
    var instructions = document.createElement('p');
    instructions.style.textAlign = "left";
    instructions.style.padding = "0 10px";
    instructions.innerHTML = '<center>Welcome! Here\'s how to use the application:</center><ol><li>Set the search radius in meters and click "Apply". Default is 1km.</li><li>Use the layer list to turn on/off amenities.</li><li>Click anywhere on the map to filter amenities. OR </li><li>Use the locate button to find amenities near your location.</li></ol>';
    body.appendChild(instructions);

    // Create the footer
    var footer = document.createElement('div');
    footer.style.backgroundColor = '#333';
    footer.style.padding = '10px';
    footer.style.borderRadius = '0 0 10px 10px';
    var closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#007bff';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';

    // Add event listener to the close button to remove the dialog
    closeButton.addEventListener('click', function() {
        document.body.removeChild(dialog);
    });

    // Append the close button to the footer
    footer.appendChild(closeButton);

    // Append the header, body, and footer to the dialog box
    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);

    // Append the dialog box to the body
    document.body.appendChild(dialog);

    // Automatically remove the dialog box after 30 seconds
    setTimeout(function() {
        if (document.body.contains(dialog)) {
            document.body.removeChild(dialog);
        }
    }, 30000);
}

// Call the function to create the welcome dialog box when the page loads
window.onload = function() {
    createWelcomeDialog();
};

// Initialize Leaflet map and add controls for interacting with the map
// This block sets up the map's center point, zoom level, and adds base layers and controls.
var map = L.map('map', {
    center: [47.799546, 13.052096], // Salzburg, Austria
    zoom: 13
});

var osmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var darkGrayCanvas = L.esri.basemapLayer('DarkGray').addTo(map);
var Topographic = L.esri.basemapLayer('Topographic');
var imagery = L.esri.basemapLayer('Imagery');

var baseMaps = {
    "Dark Gray Canvas": darkGrayCanvas,
    "Topographic": Topographic,
    "Imagery": imagery,
    "OpenStreetMap": osmap
};

L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

// Define custom icons for map markers grouped by category
// This block creates reusable icons for different categories of map features.
var icons = {
    'Education': L.icon({ iconUrl: 'css/images/education.png', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -20] }),
    'Food': L.icon({ iconUrl: 'css/images/food.png', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -20] }),
    'Health': L.icon({ iconUrl: 'css/images/healthcare.png', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -20] }),
    'Leisure': L.icon({ iconUrl: 'css/images/leisure.png', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -20] }),
    'Public Services': L.icon({ iconUrl: 'css/images/public_services.png', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -20] }),
    'Transport': L.icon({ iconUrl: 'css/images/transport.png', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -20] })
};

// Add a search bar to the map
// This block enables geocoding search functionality on the map.
L.Control.geocoder().addTo(map);

// Define the style for Salzburg city boundary
var myStyle = {
    color: '#1a1a1a',
    weight: 2,
    fillColor: 'transparent',
    fillOpacity: 0
};

// Configure radius-based feature filtering
// This block handles creating a buffer around a selected point and filtering features within that radius.
var search = 1000;
// Add event listener for the Apply Radius button 
document.getElementById('applyRadius').addEventListener('click', function () { 
    search = parseInt(document.getElementById('searchRadius').value, 10) || 1000;
});

// Add click event to the map
map.on('click', function (e) {
    createBuffer(e.latlng);
});
function createBuffer(latlng) {
    // Remove any existing buffer
    if (typeof window.buffer !== 'undefined') {
        map.removeLayer(window.buffer);
    }

    // Zoom to the received location extent and Create a new buffer
    map.panTo(latlng, { animate: true, duration: 0.5 });
    setTimeout(function(){
        map.setView(latlng, 14); 
    }, 500);
    var buffer = L.circle(latlng, { radius: search }).addTo(map);
    window.buffer = buffer;
    
    // initialize an empty array to hold the buffered features
    var bufferedFeatures = [];

    // Check each layer for points within the buffer
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            layer.eachLayer(function (marker) {
                if (marker.getLatLng && latlng.distanceTo(marker.getLatLng()) <= search) {
                    if (marker.feature.properties && marker.feature.properties.Category) {
                        // add each feature to the bufferedFeatures array
                        bufferedFeatures.push(marker.feature);
                    } else {
                        console.error('Feature is missing Category property:', marker.feature);
                    }
                }
            });
        }
    });

    // Send the filtered features to the function that creates chips
    addChips(bufferedFeatures);

    // Adjust map height to give room for the chip container
    document.getElementById('map').style.height = 'calc(100vh - 50px - 250px)';
}

// Function to add chips including hover and click event listeners to chips
// Function to find the marker associated with a feature
function findMarker(feature) {
    var foundMarker = null;
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker && layer.feature && layer.feature === feature) {
            foundMarker = layer;
        }
    });
    return foundMarker;
}

function addChips(features) {
    var chipContainer = document.getElementById('chip-container');
    chipContainer.innerHTML = ''; // Clear previous chips

    if (features.length > 0) {
        chipContainer.style.display = 'flex';
        chipContainer.style.height = '250px';
        chipContainer.style.overflowY = 'auto';

        features.forEach(function (feature) {
            var category = feature.properties.Category;
            if (category && icons[category]) {
                var chip = document.createElement('div');
                chip.className = 'chip';
                var icon = document.createElement('img');
                icon.src = icons[category].options.iconUrl;
                icon.style.width = '20px';
                chip.appendChild(icon);

                // Truncate the name if it exceeds 45 characters
                var name = feature.properties.name || 'Unknown';
                if (name.length > 45) {
                    name = name.substring(0, 42) + '...';
                }

                var text = document.createTextNode(name);
                chip.appendChild(text);
                chipContainer.appendChild(chip);

                var marker = findMarker(feature);
                if (marker) {
                    chip.addEventListener('mouseover', function() { growMarker(marker); });
                    chip.addEventListener('mouseout', function() { resetMarker(marker); });
                    chip.addEventListener('click', function() {
                        marker.openPopup();
                        map.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
                        setTimeout(function(){
                            map.setView(marker.getLatLng(), 15); 
                        }, 500);
                    });
                }
            }
        });
    } else {
        chipContainer.style.display = 'flex';
        chipContainer.style.height = 'auto';
        var noFeaturesMessage = document.createElement('div');
        noFeaturesMessage.className = 'no-features-message';
        noFeaturesMessage.textContent = 'There are no features within 1km of the selected location.';
        chipContainer.appendChild(noFeaturesMessage);
    }
}

// Add event listener for the Escape key to remove buffer and hide chip container
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        // Remove the buffer
        if (typeof window.buffer !== 'undefined') {
            map.removeLayer(window.buffer);
            delete window.buffer;
        }
        // Hide the chip container
        var chipContainer = document.getElementById('chip-container');
        chipContainer.style.display = 'none';
        chipContainer.innerHTML = ''; // Clear any chips
        // Adjust map height back to full
        document.getElementById('map').style.height = 'calc(100vh - 50px)';
    }
});

// Function to grow the marker on hover
function growMarker(marker) {
    marker.setIcon(L.icon({
        iconUrl: marker.options.icon.options.iconUrl,
        iconSize: [30, 30], // Increase the size
        iconAnchor: [15, 15], // Adjust anchor to center the icon
        popupAnchor: [0, -15]
    }));
}

// Function to reset the marker size when not hovered
function resetMarker(marker) {
    marker.setIcon(L.icon({
        iconUrl: marker.options.icon.options.iconUrl,
        iconSize: [20, 20], // Reset to original size
        iconAnchor: [10, 10], // Adjust anchor to center the icon
        popupAnchor: [0, -10]
    }));
}

// Add GeoJSON data for each category with custom icons and html customized popups
var geoJsonOptions = function(category) {
    return {
        pointToLayer: function (feature, latlng) {
            var marker = L.marker(latlng, { icon: icons[category] });
            marker.on('mouseover', function() { growMarker(marker); });
            marker.on('mouseout', function() { resetMarker(marker); });
            return marker;
        },
        onEachFeature: function (feature, layer) {
            var popupContent = '<div class="popup-content">';
            popupContent += '<div class="popup-icon-container" style="background-color:' + getCategoryColor(feature.properties.Category) + ';">';
            popupContent += '<img src="' + icons[category].options.iconUrl + '" class="popup-icon">';
            popupContent += '</div>';
            popupContent += '<div class="popup-header">' + (feature.properties.name || 'Unknown') + '</div>';
            popupContent += '<div class="popup-content">';
            popupContent += '<div class="popup-attribute"><strong>Amenity:</strong> ' + (formatText(feature.properties.amenity) || 'N/A') + '</div>';
            popupContent += '<div class="popup-attribute"><strong>Address:</strong> ' + (feature.properties.addr_street || 'N/A') + ' ' + (feature.properties.addr_housenumber || '') + ', ' + (feature.properties.addr_postcode || '') + ' ' + (feature.properties.addr_city || '') + '</div>';
            popupContent += '<div class="popup-attribute"><strong>Opening Hours:</strong> ' + (feature.properties.opening_hours || 'N/A') + '</div>';
            popupContent += '</div>';
            popupContent += '<div class="popup-footer">';
            popupContent += '<a href="tel:' + (feature.properties.phone || '#') + '" class="' + (feature.properties.phone ? '' : 'disabled') + '"><i class="fa fa-phone"></i></a>';
            popupContent += '<a href="' + (feature.properties.website || '#') + '" target="_blank" class="' + (feature.properties.website ? '' : 'disabled') + '"><i class="fa fa-globe"></i></a>';
            popupContent += '<a href="mailto:' + (feature.properties.contact_email || '#') + '" class="' + (feature.properties.contact_email ? '' : 'disabled') + '"><i class="fa fa-envelope"></i></a>';
            popupContent += '</div>';
            popupContent += '</div>';
            layer.bindPopup(popupContent);
        }
    };
};


var education = L.geoJson(education, geoJsonOptions('Education')).addTo(map);
var food = L.geoJson(food, geoJsonOptions('Food'));
var health = L.geoJson(health, geoJsonOptions('Health'));
var leisure = L.geoJson(leisure, geoJsonOptions('Leisure'));
var public_services = L.geoJson(public_services, geoJsonOptions('Public Services'));
var transport = L.geoJson(transport, geoJsonOptions('Transport'));

var salzburg = L.geoJson(sbg, { style: myStyle});

// Initially add only the education layer and Salzburg polygon to the map to make it load faster
education.addTo(map);
salzburg.addTo(map);

// Combine and manage feature layers
// This block organizes feature layers and adds a control to toggle visibility.
var features = {
    "Education": education,
    "Food and drink": food,
    "Healthcare": health,
    "Leisure": leisure,
    "Public services": public_services,
    "Transport": transport,
    "Salzburg": salzburg
};

// Add a layer control with base maps and feature layers
L.control.layers(baseMaps, features, { position: 'topright' }).addTo(map);

// Function to replace underscores with spaces and capitalize first letter of each word. THis is used in the popup to make the texts cleaner.
function formatText(text) {
    // Replace underscores with spaces
    let formattedText = text.replace(/_/g, ' ');
    
    // Capitalize the first letter of each word
    formattedText = formattedText.replace(/\b\w/g, function(letter) {
        return letter.toUpperCase();
    });
    
    return formattedText;
}

// Function to get the background color based on the category, this is used in the popup
function getCategoryColor(category) {
    switch (category) {
        case 'Food':
            return '#FFC0CB'; // Pink
        case 'Education':
            return '#FFD700'; // Gold
        case 'Healthcare':
            return '#FF0000'; // Red
        case 'Leisure':
            return '#008000'; // Green
        case 'Transport':
            return '#A52A2A'; // Brown
        case 'Public Services':
            return '#0000FF'; // Blue
        default:
            return '#333'; // Default darker color
    }
}

// It will be nice for my users to use thei'r location in addition to the ability to click anywhere on the map. THis section adds a ustom control for the Locate button
L.Control.LocateButton = L.Control.extend({
    onAdd: function(map) {
        var btn = L.DomUtil.create('button', 'leaflet-control-locate-button');
        btn.innerHTML = '<i class="fa fa-location-arrow"></i>';
        btn.style.padding = '0';
        btn.style.fontSize = '25px';
        btn.style.width = '40px'; 
        btn.style.height = '40px';
        btn.style.backgroundColor = '#007bff';
        btn.style.color = 'white';
        btn.style.border = '3px solid #ffffff';
        btn.style.borderRadius = '50%';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex'; 
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.transition = 'background-color 0.3s ease';

        // Add event listeners for hover effect
        btn.onmouseover = function() {
            btn.style.backgroundColor = '#0056b3'; // Darken background color on hover
        };
        btn.onmouseout = function() {
            btn.style.backgroundColor = '#007bff'; // Reset background color when not hovered
        };

        btn.onclick = function(e) {
            e.stopPropagation(); // Prevent the map click event from firing
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
                    // send the latlng to the create buffer function
                    createBuffer(latlng);
                    // pan and zoom the map to the user's location
                    map.panTo(latlng, { animate: true, duration: 0.5 });
                    setTimeout(function() {
                        map.setView(latlng, 14);
                    }, 500);
                }, function(error) {
                    console.error("Error getting location: " + error.message);
                    alert("Error getting location. Please enable location services.");
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        };
        return btn;
    },
});

// Add the custom control to the map
L.control.locateButton = function(opts) {
    return new L.Control.LocateButton(opts);
};

// Add the Locate button to the bottom left of the map
L.control.locateButton({ position: 'bottomright' }).addTo(map);
