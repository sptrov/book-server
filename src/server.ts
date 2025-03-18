import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Database from "./config/database/Database";
import Keys from "./config/crypto/keys";
import validateBook, { validateSearchQuery } from "./validators/BookValidator";
import BookOperations from "./dbOperations/BookOperations";

dotenv.config();
Database.connect();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { privateKey } = Keys.getKeyPair();

app.use((_req, res, next) => {
  res.setHeader("X-Public-Server-Key", Keys.getPublicKeyBase64());

  next();
});

app.get("/publicKey", (_req, res) => {
  res.json({ key: Keys.getPublicKeyBase64() });
});

app.get("/books", async (req, res) => {
  try {
    const query =
      typeof req.query.query === "string" ? req.query.query.trim() : "";

    const result = validateSearchQuery(query);
    if (result.error) {
      res.status(400).json({ error: result.data });
      return;
    }

    const publicClientKey = req.headers["x-public-client-key"] as string;
    if (!publicClientKey) {
      res.status(400).json({ error: "No public key provided" });
      return;
    }

    const books = await BookOperations.findBookByAny(query);

    const encryptedBooksL = Keys.hybridEncryptData(books, publicClientKey);

    res.json(encryptedBooksL);
  } catch (error) {
    //TODO logger.log the real internal error
    res.status(400).json({ error: "Something went wrong" });
  }
});

app.post("/books", async (req, res) => {
  try {
    const { encrypted: encryptedData } = req.body;
    const decryptedBook = Keys.decrypt(encryptedData, privateKey);

    const book = JSON.parse(decryptedBook);

    const result = validateBook(book);
    if (result.error) {
      res.status(400).json({ error: result.data });
      return;
    }

    await BookOperations.createBook(book);

    res.json({ message: "Book saved" });
  } catch (error) {
    //TODO logger.log the real internal error
    res.status(400).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
