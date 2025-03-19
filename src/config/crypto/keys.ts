import fs from "fs";
import crypto from "crypto";
import path from "path";

export default class Keys {
  private static publicKey: string;
  private static privateKey: string;

  public static getKeyPair(
    buildFolderPath = path.join(process.cwd(), "build")
  ) {
    const publicKeyPath = `${buildFolderPath}/public.pem`;
    const privateKeyPath = `${buildFolderPath}/private.pem`;

    try {
      this.publicKey = fs.readFileSync(publicKeyPath, "utf8");
      this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
    } catch (err) {
      console.log("Generating the keys");
      ({ publicKey: this.publicKey, privateKey: this.privateKey } =
        Keys.generateKeyPairs());
      console.log(this.publicKey, "PK GENERATED");
      fs.writeFileSync(publicKeyPath, this.publicKey);
      fs.writeFileSync(privateKeyPath, this.privateKey);
    }

    return { publicKey: this.publicKey, privateKey: this.privateKey };
  }

  private static generateKeyPairs() {
    const keys = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    return { publicKey: keys.publicKey, privateKey: keys.privateKey };
  }

  public static getPublicKey() {
    if (!this.publicKey) {
      throw new Error("No public key found");
    }
    return this.publicKey;
  }
  public static getPublicKeyBase64() {
    if (!this.publicKey) {
      throw new Error("No public key found");
    }

    const publicKeyBase64 = this.publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\n/g, "")
      .trim();
    return publicKeyBase64;
  }

  public static encryptData(data: object, publicKey: string) {
    const keyBuffer = Buffer.from(publicKey, "base64");
    const keyBufferBase64 = keyBuffer.toString("base64");
    const keyBufferBase64Match = keyBufferBase64.match(/.{1,64}/g);
    if (!keyBufferBase64Match) {
      throw new Error("Failed to match base64 key buffer");
    }
    const pck = `-----BEGIN PUBLIC KEY-----\n${keyBufferBase64Match.join(
      "\n"
    )}\n-----END PUBLIC KEY-----`;
    const buffer = Buffer.from(JSON.stringify(data));
    return crypto
      .publicEncrypt(
        {
          key: pck,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        buffer
      )
      .toString("base64");
  }

  public static decrypt(encryptedData: string, privateKey: string) {
    const buffer = Buffer.from(encryptedData, "base64");

    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );
    return decrypted.toString("utf8");
  }

  public static hybridEncryptData(
    data: object,
    publicKey: string
  ): {
    encryptedData: string;
    encryptedKey: string;
    authTag?: string;
  } {
    const keyBufferBase64Match = publicKey.match(/.{1,64}/g);
    if (!keyBufferBase64Match) {
      throw new Error("Failed to match base64 key buffer");
    }
    const pck = `-----BEGIN PUBLIC KEY-----\n${keyBufferBase64Match.join(
      "\n"
    )}\n-----END PUBLIC KEY-----`;

    // Generate a random AES key and IV
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    // Encrypt the data with AES
    const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
    let encryptedData = cipher.update(JSON.stringify(data), "utf8", "base64");
    encryptedData += cipher.final("base64");
    const authTag = cipher.getAuthTag();

    // Encrypt the AES key with RSA
    const encryptedKey = crypto
      .publicEncrypt(
        {
          key: pck,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.concat([aesKey, iv])
      )
      .toString("base64");

    return { encryptedData, encryptedKey, authTag: authTag.toString("base64") };
  }
}
