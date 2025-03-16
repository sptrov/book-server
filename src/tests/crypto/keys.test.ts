import fs from "fs";
import path from "path";
import crypto from "crypto";

import Keys from "../../config/crypto/keys";

function isBase64(str: string): boolean {
  if (str === "" || str.trim() === "") {
    return false;
  }
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

describe("Keys", () => {
  const buildFolderPath = path.join(process.cwd(), "build", "test");
  const publicKeyPath = `${buildFolderPath}/public.pem`;
  const privateKeyPath = `${buildFolderPath}/private.pem`;

  beforeAll(() => {
    if (!fs.existsSync(buildFolderPath)) {
      fs.mkdirSync(buildFolderPath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(publicKeyPath)) {
      fs.unlinkSync(publicKeyPath);
    }
    if (fs.existsSync(privateKeyPath)) {
      fs.unlinkSync(privateKeyPath);
    }
    if (fs.existsSync(buildFolderPath)) {
      fs.rmdirSync(buildFolderPath);
    }
  });

  test("should generate and save RSA key pairs", () => {
    const { publicKey, privateKey } = Keys.getKeyPair(buildFolderPath);

    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
    expect(fs.existsSync(publicKeyPath)).toBe(true);
    expect(fs.existsSync(privateKeyPath)).toBe(true);
  });

  test("should return the public key in base64 format", () => {
    const publicKeyBase64 = Keys.getPublicKeyBase64();
    expect(publicKeyBase64).toBeDefined();
    expect(publicKeyBase64).not.toContain("-----BEGIN PUBLIC KEY-----");
    expect(publicKeyBase64).not.toContain("-----END PUBLIC KEY-----");
    expect(isBase64(publicKeyBase64)).toBe(true);
  });

  test("should encrypt and decrypt data correctly", () => {
    const data = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      publicationDate: new Date("1925-04-10"),
    };
    const { privateKey } = Keys.getKeyPair();
    const publicKeyBase64 = Keys.getPublicKeyBase64();

    const encryptedData = Keys.encryptData(data, publicKeyBase64);
    expect(encryptedData).toBeDefined();

    const decryptedData = Keys.decrypt(encryptedData, privateKey);
    expect(decryptedData).toBe(JSON.stringify(data));
  });

  test("should hybrid encrypt data and then receive the same data after decrypt", () => {
    const data = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        publicationDate: new Date("1925-04-10"),
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        publicationDate: new Date("1960-07-11"),
      },
      {
        title: "1984",
        author: "George Orwell",
        publicationDate: new Date("1949-06-08"),
      },
    ];
    const { privateKey } = Keys.getKeyPair();
    const publicKeyBase64 = Keys.getPublicKeyBase64();

    const { encryptedData, encryptedKey, authTag } = Keys.hybridEncryptData(
      data,
      publicKeyBase64
    );
    expect(encryptedData).toBeDefined();
    expect(encryptedKey).toBeDefined();
    expect(authTag).toBeDefined();

    const keyAndIv = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedKey, "base64")
    );
    const aesKey = keyAndIv.slice(0, 32);
    const iv = keyAndIv.slice(32);

    const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);
    if (authTag) {
      decipher.setAuthTag(Buffer.from(authTag, "base64"));
    }
    let decryptedData = decipher.update(encryptedData, "base64", "utf8");
    decryptedData += decipher.final("utf8");

    expect(decryptedData).toBe(JSON.stringify(data));
  });
});
