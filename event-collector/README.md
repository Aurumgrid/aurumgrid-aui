# Event Collector Component

This component provides a simple Node.js/Express server to collect user interaction events from a web page and a corresponding example capture script.

## Files

- `collector.js`: A Node.js server that listens for POST requests on `/collect`. It saves the JSON payload of each request to a `logs/` directory.
- `capture-example.html`: An example HTML page with an embedded JavaScript that captures user events (page load, clicks, scroll, video play/pause, mouse movement) and sends them to the collector server.
- `package.json`: Defines the project dependencies and scripts.
- `.gitignore`: Excludes `node_modules` and the `logs` directory from version control.

## Usage

1. **Install Dependencies:**
   Navigate to the `event-collector` directory and run:
   ```bash
   npm install
   ```

2. **Run the Collector Server:**
   ```bash
   npm start
   ```
   The server will start and listen on `http://localhost:4000`.

3. **Generate Events:**
   Open the `capture-example.html` file in a web browser. As you interact with the page (scrolling, clicking, playing the video), the script will send event data to the collector server. The server will log the received events to the console and save them as individual JSON files in the `logs/` directory.
