import { Body, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "@/pipes";
import {
  SignInDto,
  signInSchema,
  SignUpDto,
  signUpSchema,
} from "@tasks-estimate/shared";
import { AuthModuleController } from "./decorators";
import { GoogleAuthGuard } from "./guards";
import { GoogleUserProfile } from "./types";

@AuthModuleController()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Signs in user with email and password.
   */
  @Post("sign-in")
  signIn(@Body(new ZodValidationPipe(signInSchema)) signInPayload: SignInDto) {
    return this.authService.signIn(signInPayload);
  }

  /**
   * Registers a new user and returns JWT token.
   */
  @Post("sign-up")
  signUp(@Body(new ZodValidationPipe(signUpSchema)) signUpPayload: SignUpDto) {
    return this.authService.signUp(signUpPayload);
  }

  /**
   * Starts Google OAuth flow.
   */
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleAuth(): boolean {
    return true;
  }

  /**
   * Handles Google OAuth callback and returns JWT token.
   */
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() request: Request & { user: GoogleUserProfile },
    @Res() response: Response,
  ): Promise<void> {
    const authResponse = await this.authService.signInWithGoogle(request.user.email);
    const clientUrl = this.configService.get<string>("CLIENT_URL") ?? "http://localhost:3001";
    const redirectUrl = `${clientUrl}/sign-in?access_token=${encodeURIComponent(authResponse.access_token)}`;

    response.redirect(redirectUrl);
  }
}
