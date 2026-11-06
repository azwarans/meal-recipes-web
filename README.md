# Meal Recipes

## Overview
A web-based recipe discovery application built with vanilla JavaScript and native Web Components. It allows users to search meal recipes, explore international cuisines by category, view detailed ingredients and step-by-step instructions, watch video tutorials, discover random dishes, and save favorite recipes locally.

## Features
- **Recipe Search:** Search dishes by name or main ingredient with real-time input validation.
- **Category Browsing:** Filter recipes across international food categories (e.g., Beef, Chicken, Dessert, Seafood, Vegetarian).
- **Featured Recipes:** Browse a curated collection of recipes on the initial screen with an expandable "Show More" option.
- **Detailed Recipe View:** Access detailed ingredient measurements, structured cooking instructions, and food origin badges in a responsive modal dialog.
- **Surprise Me:** Discover a random recipe instantly with one click.
- **Video Tutorials:** Direct links to official YouTube cooking walkthroughs when available.
- **Favorites & Bookmarks:** Save and remove recipes locally with instant bookmark state updates.
- **Saved Recipes Tab:** Dedicated view to review your saved recipe collection, with an empty state helper.
- **User Feedback & Status:** Top-positioned responsive toast notifications, loading indicators, empty search results, and network error handling with retry options.

## Tech Stack
- **Language:** JavaScript (ES6+)
- **Architecture:** Native Web Components (Custom Elements v1 & Shadow DOM)
- **Bundler & Tooling:** Webpack 4, Babel
- **Styles:** Modular CSS with CSS Custom Properties and scoped Shadow DOM styling
- **API:** [TheMealDB](https://www.themealdb.com/) REST API
- **Storage:** Browser `localStorage` API

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation
Clone or download the project, then install dependencies:
```bash
npm install
```

### Run Locally
Start the development server:
```bash
npm run start-dev
```
Once started, the application will be accessible at:
- Local: `http://localhost:8080/`
- Network: `http://<your-local-ip>:8080/`

## Production Build
To create an optimized production build:
```bash
npm run build
```
The compiled output files will be generated in the `dist/` directory.

## Data Source & Storage
- **Recipe Data:** Powered by the free public tier of **TheMealDB API**. No API key or authentication is required.
- **Favorites Persistence:** Saved recipes are stored locally on the user's browser via the `localStorage` API under the key `meal_recipes_saved`.
- **Sync Limitation:** Data is stored locally per browser/device and does not synchronize across different devices or browsers.
