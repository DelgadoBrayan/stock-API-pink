import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { z } from "zod";

const authService = new AuthService();
const authInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const payload = authInputSchema.parse(req.body);
    const result = await authService.register(payload.email, payload.password);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const payload = authInputSchema.parse(req.body);
    const result = await authService.login(payload.email, payload.password);
    res.status(200).json(result);
  },
};
