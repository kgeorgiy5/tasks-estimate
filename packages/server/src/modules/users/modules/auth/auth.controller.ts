import { Body, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "@/pipes";
import {
  SignInDto,
  signInSchema,
  SignUpDto,
  signUpSchema,
} from "@tasks-estimate/shared";
import { AuthModuleController } from "./decorators";

@AuthModuleController()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("sign-in")
  signIn(@Body(new ZodValidationPipe(signInSchema)) signInPayload: SignInDto) {
    return this.authService.signIn(signInPayload);
  }

  @Post("sign-up")
  signUp(@Body(new ZodValidationPipe(signUpSchema)) signUpPayload: SignUpDto) {
    return this.authService.signUp(signUpPayload);
  }
}
