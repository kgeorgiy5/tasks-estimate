import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { USER_MODEL_TOKEN, UserSchema } from "../../models";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./guards/auth.guard";
import { GoogleAuthGuard } from "./guards";
import { GoogleStrategy } from "./strategies";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL_TOKEN, schema: UserSchema }]),
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string | undefined>("JWT_SECRET");
        if (!secret) {
          throw new Error("Missing JWT_SECRET environment variable");
        }

        const rawLifetime = config.get<number | `${number}h` | undefined>(
          "JWT_LIFETIME",
        );

        return {
          secret,
          signOptions: {
            expiresIn: rawLifetime ?? "1h",
          },
        };
      },
    }),
  ],
  providers: [AuthService, AuthGuard, GoogleAuthGuard, GoogleStrategy],
  exports: [AuthGuard, GoogleAuthGuard, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
