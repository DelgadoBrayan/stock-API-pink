import { BlobSASPermissions, BlobServiceClient, SASProtocol, StorageSharedKeyCredential, generateBlobSASQueryParameters } from "@azure/storage-blob";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";

export class StorageService {
  private blobServiceClient: BlobServiceClient;

  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
  }

  async uploadFile(file: Express.Multer.File): Promise<{ fileName: string; sasUrl: string }> {
    const extension = file.originalname.includes(".") ? `.${file.originalname.split(".").pop()}` : "";
    const fileName = `${randomUUID()}${extension}`;
    if (env.NODE_ENV !== "production") {
      const fakeSasToken = `dev-sas-${Date.now()}`;
      return {
        fileName,
        sasUrl: `https://local-dev-storage/${env.AZURE_STORAGE_CONTAINER_NAME}/${fileName}?${fakeSasToken}`,
      };
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_NAME);
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      const accountName = this.blobServiceClient.accountName;
      const accountKey = this.extractAccountKey();
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
      const expiresOn = new Date(Date.now() + env.AZURE_STORAGE_SAS_EXPIRES_MINUTES * 60 * 1000);

      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: env.AZURE_STORAGE_CONTAINER_NAME,
          blobName: fileName,
          permissions: BlobSASPermissions.parse("r"),
          startsOn: new Date(),
          expiresOn,
          protocol: SASProtocol.Https,
        },
        sharedKeyCredential
      ).toString();

      return { fileName, sasUrl: `${blockBlobClient.url}?${sasToken}` };
    } catch (error) {
      if (env.NODE_ENV !== "production") {
        const fakeSasToken = `dev-sas-${Date.now()}`;
        return {
          fileName,
          sasUrl: `https://local-dev-storage/${env.AZURE_STORAGE_CONTAINER_NAME}/${fileName}?${fakeSasToken}`,
        };
      }

      throw error;
    }
  }

  private extractAccountKey(): string {
    const keyMatch = /AccountKey=([^;]+)/.exec(env.AZURE_STORAGE_CONNECTION_STRING);
    if (!keyMatch?.[1]) {
      throw new Error("Invalid Azure Storage connection string");
    }
    return keyMatch[1];
  }
}
