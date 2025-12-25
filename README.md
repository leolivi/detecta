# Detecta

This is an extension to uncover hidden tracking features. Hover your cursor over a website and see where trackers are hiding. You can find more information in the dashboard.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18+ or 20+) installed on your machine.

### Setup

1. Clone or fork the repository :

   ```sh
   # To clone
   git clone https://github.com/leolivi/detecta
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

## 📦 Build

To create a production build:

```sh
npm run build
```

This will generate the build files in the `build` directory.

## 📂 Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" using the toggle switch in the top right corner.
3. Click "Load unpacked" and select the `build` directory.

Your React app should now be loaded as a Chrome extension!

## 🗂️ Project Structure

- `public/`: Contains static files and the `manifest.json`.
- `src/`: Contains the React app source code.
- `build/`: Automatically generated folder to upload in Chrome.
- `vite.config.ts`: Vite configuration file.
- `tsconfig.json`: TypeScript configuration file.
- `package.json`: Contains the project dependencies and scripts.

## License

This project is licensed under the MIT License.

## Source

developer.chrome.com, 2025. Chrome Extensions Manifest V3. [online] Chrome for Developers. Verfügbar unter: https://developer.chrome.com/docs/extensions?hl=de [Zugegriffen 13 November 2025].

Duck Duck Go, Inc., 2025. duckduckgo/tracker-radar. Verfügbar unter: https://github.com/duckduckgo/tracker-radar [Zugegriffen 13 November
2025].

Mozilla, 2025. Browser extensions - Mozilla | MDN. [online] MDN Web Docs.
Verfügbar unter: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/
WebExtensions> [Zugegriffen 13 November 2025].

Oh, C., 2025. 5tigerjelly/chrome-extension-react-template. Verfügbar unter:
<https://github.com/5tigerjelly/chrome-extension-react-template> [Zugegriffen
13 November 2025].

Michalczyk, M., 2025. SVG Shapes. [online] Verfügbar unter: https://www.shapes.gallery/ [Zugegriffen 25 Dezember 2025].
