import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {
  Profile,
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from "passport-google-oauth20";
import { GoogleUserProfile } from "../types";

/**
 * Builds options for Google OAuth strategy from environment variables.
 */
const createGoogleStrategyOptions = (
  configService: ConfigService,
): StrategyOptions => {
  const clientID = configService.get<string>("GOOGLE_CLIENT_ID");
  const clientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET");

  if (!clientID || !clientSecret) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables",
    );
  }

  const callbackURL =
    configService.get<string>("GOOGLE_CALLBACK_URL") ??
    `http://localhost:${configService.get<string>("PORT") ?? "3000"}/users/auth/google/callback`;

  return {
    clientID,
    clientSecret,
    callbackURL,
    passReqToCallback: false,
    scope: ["email", "profile"],
  };
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super(createGoogleStrategyOptions(configService));
  }

  /**
   * Validates Google profile payload and forwards authenticated user data.
   */
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new UnauthorizedException(), undefined);
      return;
    }

    const user: GoogleUserProfile = { email };

    done(undefined, user);
  }
}
