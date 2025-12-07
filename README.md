# Xcrape - Visual Web Scraper & Code Generator

A visual tool to help developers generate web scraping code (Python/BeautifulSoup or Selenium) by simply pointing and clicking on a target webpage.

## Features

*   **Visual Inspector**: Load any URL and hover over elements to identify them.
*   **Code Generation**: Automatically generates Python code for `BeautifulSoup4` or `Selenium` based on your selection.
*   **Deep DOM Tree**: Navigate deeply nested structures with a collapsible tree view.
*   **XPath Support**: Select elements using full XPath queries with validation and error feedback.
*   **Data Extraction**: Select specific attributes (Text, HTML, href, src, etc.) to extract.
*   **Smart Selection**: Click a tree node, parent button, or visual element to update the context immediately.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend**: Node.js, Express (functioning as a proxy to handle CORS and script injection)

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd WebScrapper
    ```

2.  **Install Dependencies**
    You need to install dependencies for both client and server.

    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

## Usage

1.  **Start the Server** (Proxy)
    ```bash
    cd server
    node server.js
    # Runs on http://localhost:3000
    ```

2.  **Start the Client**
    ```bash
    cd client
    npm run dev
    # Runs on http://localhost:5173
    ```

3.  **Open the App**
    Go to `http://localhost:5173` in your browser.

4.  **Scrape**
    *   Enter a target URL (e.g., `https://example.com`) and click **Load**.
    *   Hover over elements to see them highlighted.
    *   **Click** an element to select it.
    *   Use the **Inspector Sidebar** to:
        *   View DOM structure (Copy tree with the copy button!).
        *   Select which attributes you want to extract.
        *   Copy the generated Python code.
