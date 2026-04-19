import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(() => {
    usersService = {
      listAllUsers: jest.fn(),
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
    };

    // @ts-ignore - simple mock
    controller = new UsersController(usersService);
  });

  it("forwards listAllUsers to service", async () => {
    const list = [{ _id: "1" }];
    usersService.listAllUsers.mockResolvedValue(list);

    const res = await controller.listAllUsers();

    expect(usersService.listAllUsers).toHaveBeenCalled();
    expect(res).toBe(list);
  });

  it("forwards createUser to service", async () => {
    const dto = { email: "a@example.com" };
    usersService.createUser.mockResolvedValue({ _id: "1", email: "a@example.com" });

    const res = await controller.createUser(dto as any);

    expect(usersService.createUser).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ _id: "1", email: "a@example.com" });
  });

  it("forwards findUserByEmail to service", async () => {
    usersService.findUserByEmail.mockResolvedValue({ _id: "1", email: "e@example.com" });

    const res = await controller.findUserByEmail("e@example.com");

    expect(usersService.findUserByEmail).toHaveBeenCalledWith("e@example.com");
    expect(res).toEqual({ _id: "1", email: "e@example.com" });
  });

  it("forwards findUserById to service", async () => {
    usersService.findUserById.mockResolvedValue({ _id: "2" });

    const res = await controller.findUserById("2");

    expect(usersService.findUserById).toHaveBeenCalledWith("2");
    expect(res).toEqual({ _id: "2" });
  });
});
