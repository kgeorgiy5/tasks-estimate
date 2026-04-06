import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { USER_MODEL_TOKEN, UserSchema } from "../../models";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL_TOKEN, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: new ConfigService().get<string>("JWT_SECRET"),
      signOptions: {
        expiresIn: new ConfigService().get<number | `${number}h`>(
          "JWT_LIFETIME",
        ),
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
