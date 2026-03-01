import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { PrivilegesModule } from "./modules/privileges/privileges.module";
import { BillingModule } from "./modules/billing/billing.module";
import { MongooseModule } from "@nestjs/mongoose";
import { USER_MODEL_TOKEN, UserSchema } from "./models";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL_TOKEN, schema: UserSchema }]),
    AuthModule,
    PrivilegesModule,
    BillingModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
