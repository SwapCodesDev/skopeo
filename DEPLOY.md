# Deploying Skopeo to Vercel

Skopeo is configured to be easily deployed on Vercel as a monorepo containing both a React Frontend and an Express Backend.

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`)
- A Vercel account

## Deployment Steps

1.  **Login to Vercel**:
    ```bash
    vercel login
    ```

2.  **Deploy**:
    Run the following command from the root of the project:
    ```bash
    vercel
    ```

3.  **Project Configuration**:
    - Build Command: `cd client && npm run build`
    - Output Directory: `client/dist`
    - Development Command: `npm run dev` (Root)
    - Root Directory: `./` (Leave as default)

    *Note: The `vercel.json` file usually handles the build configuration automatically, but if asked via UI, use the above.*

## Environment Variables

No special environment variables are required for the standard setup as the application dynamically detects its host URL.

## Local Development

To run locally with the new configuration:

1.  **Frontend**:
    ```bash
    cd client
    npm run dev
    ```
    Runs on `http://localhost:5173`. Proxies `/proxy` and `/js` to the backend.

2.  **Backend**:
    ```bash
    cd server
    npx nodemon server.js
    ```
    Runs on `http://localhost:3000`.

Open `http://localhost:5173` to use the app.
