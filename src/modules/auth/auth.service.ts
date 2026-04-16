import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { env } from "../../config/env";
import { UserEntity } from "./entities/user.entity";

export class AuthService {
  private userRepository: Repository<UserEntity>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(UserEntity);
  }

  async register(email: string, password: string): Promise<{ id: string; email: string }> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: passwordHash });
    const savedUser = await this.userRepository.save(user);

    return { id: savedUser.id, email: savedUser.email };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    });

    return { token };
  }
}
