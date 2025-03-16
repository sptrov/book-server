import request from "supertest";
import Keys from "../config/crypto/keys";

import app from "../server";

describe("Server", () => {
  it("should return the public key", async () => {
    const response = await request(app).get("/publicKey");
    expect(response.status).toBe(200);
    expect(response.body.key).toBeDefined();
  });

  it("should return books based on query", async () => {
    const publicClientKey = Keys.getPublicKeyBase64();
    const response = await request(app)
      .get("/books")
      .set("x-public-client-key", publicClientKey)
      .query({ query: "test" });
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.authTag).toBeDefined();
    expect(response.body.encryptedKey).toBeDefined();
    expect(response.body.encryptedData).toBeDefined();
  });

  it("should create a new book", async () => {
    const book = {
      title: "Test Book",
      author: "Test Author",
      publicationDate: new Date().toISOString(),
    };
    const publicClientKey = Keys.getPublicKeyBase64();
    const encryptedData = Keys.encryptData(book, publicClientKey);

    const response = await request(app)
      .post("/books")
      .send({ encrypted: encryptedData });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book saved");
  });
});
