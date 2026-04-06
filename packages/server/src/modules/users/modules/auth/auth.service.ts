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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(USER_MODEL_TOKEN) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private compareHash(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  private hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltRounds = this.configService.get<number>("BCRYPT_SALT");

      hash(password, saltRounds, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

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

    const jwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return authResponseSchema.parse({
      access_token: await this.jwtService.signAsync(jwtPayload),
    });
  }

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

    const jwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return authResponseSchema.parse({
      access_token: await this.jwtService.signAsync(jwtPayload),
    });
  }
}
