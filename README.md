# Geographic Thesaurus Tool

**Geographic Thesaurus Tool** is a web-based JavaScript tool that allows users to search for location names using the **Geonames API**, select from a list of possible matches, and display the selected location on an interactive map. The tool provides detailed information about the location and allows users to export the data as a **JSON file** for further use.

## Features

- **Search Locations**: Search for locations by name using the **Geonames API**.
- **Auto-Suggestions**: Provide a list of possible location matches for user selection.
- **Display on Map**: Show the selected location on an interactive map with multiple layers (e.g., terrain, satellite).
- **Detailed Location Info**: View detailed information about the selected location, such as geographical coordinates, country, population, etc.
- **Export Data**: Export the location details as a **JSON file**.

## Screenshots

_Add screenshots or a GIF demonstrating the tool's functionality here._

## Technologies Used

- **Frontend**: JavaScript, HTML, CSS
- **API**: [Geonames API](http://www.geonames.org/)
- **Maps**: Integrates with mapping libraries like Leaflet or Google Maps (replace with the actual library used)
- **Data Export**: JSON file export functionality

## Getting Started

### Prerequisites

To run the **Geographic Thesaurus Tool** locally, you will need:

- A modern web browser (e.g., Chrome, Firefox, Edge)
- Optionally, a local web server to serve the files

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/geographic-thesaurus-tool.git
   cd geographic-thesaurus-tool

2. Open the index.html file in your browser:

You can either:

Open the file directly in a browser (index.html), or
Serve the files using a local web server (e.g., Python’s SimpleHTTPServer):


### Configuration
API Key: You need to provide a Geonames API key in the app.js file. Replace the placeholder username (demo) with your own:


var url = "https://secure.geonames.org/search?q=" + locationName + "&username=YOUR_USERNAME&maxRows=10&style=SHORT&type=json";
Maps: You can configure the map layers or settings in app.js to customize the map display (e.g., switch between map types like satellite or terrain).

### Usage
- Search for a location: Enter a location name in the input field and click Search.
- Select from suggestions: The tool will display a list of possible locations. Select the desired location from the list.
- View the location: The selected location will be displayed on the map, along with additional information such as coordinates, country, and population.
- Export location data: Click the Export button to download a JSON file with detailed information about the selected location.

### License
This project is licensed under the MIT License - see the LICENSE file for details.

### Acknowledgements
- Geonames API
- Mapping libraries (Leaflet, Google Maps, etc.)
- JSON export functionality

### Contact
