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

## 🏗️ Development

To start the development server:

```sh
npm run dev
```

This will start the Vite development server and open your default browser.

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
- `vite.config.ts`: Vite configuration file.
- `tsconfig.json`: TypeScript configuration file.
- `package.json`: Contains the project dependencies and scripts.

## License

This project is licensed under the MIT License.

## Source

Manifest V3 Documentation
https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3?hl=de

MDN Browser Extension Documentation
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

Chrome Extension React / Vite Template
https://github.com/5tigerjelly/chrome-extension-react-template

Logo SVG
https://www.shapes.gallery/
# detecta
