# Product Tracker Frontend

This is the **frontend** for the Product Tracker system. It is a React application designed to consume a FastAPI backend that manages product data, user accounts, and price history, powered by web scrapers and a database.

## Features

- User authentication and registration
- Product listing, creation, editing, and deletion
- Product detail view with price history chart
- Management of source websites and search configurations
- Responsive UI built with Material-UI
- Integration with a FastAPI backend

## Prerequisites

- [Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) installed on your machine
- The backend FastAPI server running and accessible (see backend documentation for setup)

## Usage

### 1. Clone the repository

```bash
git clone git@github.com:pattersonrptr/product_tracker_front.git
cd product_tracker_front
```

### 2. Configure the Backend URL

By default, the frontend expects the backend to be available at `http://127.0.0.1:8000`.  
If your backend runs elsewhere, update the `baseURL` in [`src/api/axiosConfig.js`](src/api/axiosConfig.js):

```js
const baseURL = 'http://127.0.0.1:8000';
```

### 3. Build and Run with Docker

You can build and run the frontend using Docker.  
```bash
docker compose up --build
```

- The frontend will be available at [http://localhost:3000](http://localhost:3000)
- Make sure the backend FastAPI server is running and accessible from the container

### 4. Development (without Docker)

If you prefer to run locally for development:

```bash
npm install
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000) by default.

## Run tests

To run the frontend tests, use the following command:

```bash
npm test
```
