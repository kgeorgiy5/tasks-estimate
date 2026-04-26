jest.mock("@/pipes", () => ({ ZodValidationPipe: jest.fn() }), {
  virtual: true,
});
jest.mock(
  "@/modules/users/decorators",
  () => ({
    UsersModuleController: (prefix?: string) => (target: any) => target,
  }),
  { virtual: true },
);

const { AuthController } = require("./auth.controller");

describe("AuthController", () => {
  let controller: InstanceType<typeof AuthController>;
  let authService: any;
  let configService: any;

  beforeEach(() => {
    authService = {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
    };
    configService = { get: jest.fn().mockReturnValue("http://localhost:3001") };
    // @ts-ignore
    controller = new AuthController(authService, configService);
  });

  it("forwards signIn to service", async () => {
    const payload = { email: "a@a", password: "p" };
    authService.signIn.mockResolvedValue({ access_token: "t" });

    const res = await controller.signIn(payload as any);

    expect(authService.signIn).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ access_token: "t" });
  });

  it("forwards signUp to service", async () => {
    const payload = { email: "b@b", password: "p" };
    authService.signUp.mockResolvedValue({ access_token: "t2" });

    const res = await controller.signUp(payload as any);

    expect(authService.signUp).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ access_token: "t2" });
  });

  it("redirects google callback with issued token", async () => {
    const request = { user: { email: "google@user.com" } };
    const response = { redirect: jest.fn() };
    authService.signInWithGoogle.mockResolvedValue({ access_token: "tg" });

    await controller.googleAuthCallback(request as any, response as any);

    expect(authService.signInWithGoogle).toHaveBeenCalledWith("google@user.com");
    expect(response.redirect).toHaveBeenCalledWith(
      "http://localhost:3001/sign-in?access_token=tg",
    );
  });
});
