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

  beforeEach(() => {
    authService = { signIn: jest.fn(), signUp: jest.fn() };
    // @ts-ignore
    controller = new AuthController(authService);
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
});
