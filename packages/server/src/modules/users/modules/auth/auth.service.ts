import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  AuthResponseDto,
  authResponseSchema,
  ErrorIds,
  SignInDto,
  SignUpDto,
} from "@tasks-estimate/shared";
import { Model } from "mongoose";
import { USER_MODEL_TOKEN, User } from "../../models";
import { compare, hash } from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(USER_MODEL_TOKEN) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Compares plain text password with a stored hash.
   */
  private compareHash(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  /**
   * Hashes password using configured salt rounds.
   */
  private hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltRounds = Number(this.configService.get<number>("BCRYPT_SALT"));

      hash(password, saltRounds, (err, hashed) => {
        if (err) {
          reject(err);
        } else {
          resolve(hashed);
        }
      });
    });
  }

  /**
   * Builds and signs JWT token payload for a user.
   */
  private async createAuthResponse(user: Pick<User, "_id" | "email">): Promise<AuthResponseDto> {
    const jwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return authResponseSchema.parse({
      access_token: await this.jwtService.signAsync(jwtPayload),
    });
  }

  /**
   * Finds existing user by email or creates one for Google OAuth.
   */
  private async getOrCreateGoogleUser(email: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      return existingUser;
    }

    return this.userModel.create({
      email,
      password: await this.hashPassword(randomUUID()),
    });
  }

  /**
   * Signs in user with email and password.
   */
  public async signIn({
    email,
    password,
  }: SignInDto): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await this.compareHash(password, user.password))) {
      throw new UnauthorizedException();
    }

    return this.createAuthResponse(user);
  }

  /**
   * Registers a new user with email and password.
   */
  public async signUp({
    email,
    password,
  }: SignUpDto): Promise<AuthResponseDto> {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new UnauthorizedException(ErrorIds.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
    });

    return this.createAuthResponse(user);
  }

  /**
   * Signs in or creates a user authenticated by Google.
   */
  public async signInWithGoogle(email: string): Promise<AuthResponseDto> {
    const user = await this.getOrCreateGoogleUser(email);

    return this.createAuthResponse(user);
  }
}
