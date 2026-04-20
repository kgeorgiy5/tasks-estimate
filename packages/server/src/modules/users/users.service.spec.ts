jest.mock("@tasks-estimate/shared", () => ({
  ErrorIds: {
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    USER_NOT_FOUND: "USER_NOT_FOUND",
  },
  getUserSchema: { parse: jest.fn() },
  listUsersSchema: { parse: jest.fn() },
}));

import { ConflictException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  getUserSchema,
  listUsersSchema,
  ErrorIds,
} from "@tasks-estimate/shared";

describe("UsersService", () => {
  let service: UsersService;
  let userModel: any;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    userModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    // Construct service with the mocked model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - passing mock instead of InjectModel result
    service = new UsersService(userModel);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("throws ConflictException when creating a user that already exists", async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "1" }),
    });

    await expect(
      service.createUser({ email: "exists@example.com" } as any),
    ).rejects.toThrow(ConflictException);
    await expect(
      service.createUser({ email: "exists@example.com" } as any),
    ).rejects.toThrow(ErrorIds.USER_ALREADY_EXISTS);
  });

  it("creates and returns a parsed user on success", async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const created = {
      _id: "1",
      email: "a@example.com",
      toObject: () => ({ _id: "1", email: "a@example.com" }),
    };

    userModel.create.mockResolvedValue(created);
    (getUserSchema.parse as jest.Mock).mockImplementation((v) => v);

    const res = await service.createUser({ email: "a@example.com" } as any);

    expect(userModel.create).toHaveBeenCalled();
    expect(getUserSchema.parse).toHaveBeenCalledWith(created.toObject());
    expect(res).toEqual(created.toObject());
  });

  it("deletes created user and returns undefined when parsing fails", async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const created = {
      _id: "2",
      email: "bad@example.com",
      toObject: () => ({ _id: "2", email: "bad@example.com" }),
    };

    userModel.create.mockResolvedValue(created);
    (getUserSchema.parse as jest.Mock).mockImplementation(() => {
      throw new Error("parse error");
    });
    userModel.findByIdAndDelete.mockResolvedValue(null);

    const res = await service.createUser({ email: "bad@example.com" } as any);

    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(created._id);
    expect(res).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating user:",
      expect.any(Error),
    );
  });

  it("findUserByEmail throws NotFoundException when missing", async () => {
    userModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findUserByEmail("noone@example.com")).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.findUserByEmail("noone@example.com")).rejects.toThrow(
      ErrorIds.USER_NOT_FOUND,
    );
  });

  it("findUserByEmail returns parsed user when found", async () => {
    const found = { _id: "3", email: "found@example.com" };
    userModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(found),
    });
    (getUserSchema.parse as jest.Mock).mockImplementation((v) => v);

    const res = await service.findUserByEmail("found@example.com");

    expect(res).toEqual(found);
    expect(getUserSchema.parse).toHaveBeenCalledWith(found);
  });

  it("findUserById throws NotFoundException when missing", async () => {
    userModel.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findUserById("unknown-id")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("listAllUsers returns parsed list", async () => {
    const list = [{ _id: "1" }];
    userModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(list),
    });
    (listUsersSchema.parse as jest.Mock).mockImplementation((v) => v);

    const res = await service.listAllUsers();

    expect(res).toEqual(list);
    expect(listUsersSchema.parse).toHaveBeenCalledWith(list);
  });

  it("removeUserByEmail throws NotFoundException when user missing", async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.removeUserByEmail("noone@example.com"),
    ).rejects.toThrow(NotFoundException);
  });

  it("removeUserByEmail deletes when user exists", async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "1" }),
    });
    userModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    await expect(
      service.removeUserByEmail("someone@example.com"),
    ).resolves.toBeUndefined();
    expect(userModel.deleteOne).toHaveBeenCalledWith({
      email: "someone@example.com",
    });
  });
});
