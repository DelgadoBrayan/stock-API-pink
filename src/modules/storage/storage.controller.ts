import { Request, Response } from "express";
import { StorageService } from "./storage.service";

const storageService = new StorageService();

export const storageController = {
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new Error("File is required");
    }

    const result = await storageService.uploadFile(req.file);
    res.status(201).json(result);
  },
};
