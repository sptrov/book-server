# Books API

This is a Books API project built with Node.js, Express, and MongoDB. The API allows you to manage a collection of books.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v14.x or later) ( v20.x used during dev)
- npm (v6.x or later) (v10.x used during dev)
- MongoDB/mongodb-community

## Installation

1. Clone the repository:

   ```bash
   cd books-api
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

   ```properties
   PORT=3000
   MONGO_URI='mongodb://localhost:27017/books'
   ```

   Beware the MONGO_URL if you dont use the default mongo port

## Running the Project

1. Start the MongoDB server

2. Run the project:

   ```bash
   npm start
   ```

   or

   ```bash
   npm run dev
   ```

   The server will start on the port specified in the `.env` file (default is 3000).

## Optional

run

```bash
npm run db:seed
```

if you need to create the db and provide few books

## API Endpoints

Here are some of the main API endpoints:

- `GET /books` - Get a list of all books
  The endpoint reads the public key generated from the client and provided by header and encrypts the response with RSA+AES since the collection might get bigger
- `POST /books` - Create a new book - receives an ecrypted with just RSA key provided initially by the server and encrypted on the client and decrypts the body on the server and validates and saved the mongo model.

## Security and Validation

- The API is protected with Zod validators to ensure that the data being processed is valid.
- When the application starts, a public and private RSA key pair is generated and stored in the `build` folder.
- The `POST /books` endpoint uses a combination of RSA and AES encryption to securely encrypt the body of the response.

## Tests and coverage

in tests folder I picked to cover the keys encryption/decryption functionality and also some tests for the api server
