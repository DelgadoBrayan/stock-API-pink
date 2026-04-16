import { Request, Response } from "express";
import { MarketService } from "./market.service";
import { z } from "zod";

const marketService = new MarketService();
const querySchema = z.object({
  days: z.coerce.number().int().positive().max(100).optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
});

export const marketController = {
  async getExternalData(req: Request, res: Response): Promise<void> {
    const { days } = querySchema.parse(req.query);
    const result = await marketService.getExternalData(days);
    res.status(200).json(result);
  },

  async getHistory(req: Request, res: Response): Promise<void> {
    const { limit } = querySchema.parse(req.query);
    const result = await marketService.getHistory(limit);
    res.status(200).json(result);
  },
};
