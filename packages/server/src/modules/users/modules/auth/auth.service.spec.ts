jest.mock("@tasks-estimate/shared", () => ({
  ErrorIds: { USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS" },
  authResponseSchema: { parse: jest.fn() },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn((password: string, salt: number, cb: Function) =>
    cb(null, "hashed-password"),
  ),
}));

import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { authResponseSchema, ErrorIds } from "@tasks-estimate/shared";

describe("AuthService", () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: any;
  let configService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    userModel = { findOne: jest.fn(), create: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue("token") };
    configService = { get: jest.fn().mockReturnValue(1) };

    // @ts-ignore
    service = new AuthService(userModel, jwtService, configService);
  });

  it("signIn throws when user not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    await expect(
      service.signIn({ email: "a@a", password: "p" } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("signIn throws when password does not match", async () => {
    const bcrypt = require("bcrypt");
    userModel.findOne.mockResolvedValue({ password: "hash" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.signIn({ email: "a@a", password: "p" } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("signIn returns token when credentials valid", async () => {
    const bcrypt = require("bcrypt");
    const user = {
      _id: { toString: () => "uid" },
      email: "a@a",
      password: "hash",
    };
    userModel.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (authResponseSchema.parse as jest.Mock).mockImplementation((v) => v);

    const res = await service.signIn({ email: "a@a", password: "p" } as any);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "uid",
      email: "a@a",
    });
    expect(res).toEqual({ access_token: "token" });
  });

  it("signUp throws when user already exists", async () => {
    userModel.findOne.mockResolvedValue({ _id: "1" });

    await expect(
      service.signUp({ email: "a@a", password: "p" } as any),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      service.signUp({ email: "a@a", password: "p" } as any),
    ).rejects.toThrow(ErrorIds.USER_ALREADY_EXISTS);
  });

  it("signUp creates user, hashes password and returns token", async () => {
    const bcrypt = require("bcrypt");
    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue({
      _id: { toString: () => "newid" },
      email: "b@b",
    });
    // hash mock calls callback and returns 'hashed-password'
    (authResponseSchema.parse as jest.Mock).mockImplementation((v) => v);

    const res = await service.signUp({ email: "b@b", password: "p" } as any);

    expect(userModel.create).toHaveBeenCalledWith({
      email: "b@b",
      password: "hashed-password",
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "newid",
      email: "b@b",
    });
    expect(res).toEqual({ access_token: "token" });
  });
});
