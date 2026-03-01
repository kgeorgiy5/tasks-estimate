import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, USER_MODEL_TOKEN } from "./models";
import { Model } from "mongoose";
import {
  CreateUserDto,
  ErrorIds,
  GetUserDto,
  getUserSchema,
  ListUsersDto,
  listUsersSchema,
} from "@tasks-estimate/shared";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_MODEL_TOKEN) private readonly userModel: Model<User>,
  ) {}

  private async checkIfUserExists(email: string) {
    const user = await this.userModel.findOne({ email }).exec();

    return !!user;
  }

  public async createUser(createUserDto: CreateUserDto) {
    if (await this.checkIfUserExists(createUserDto.email)) {
      throw new ConflictException(ErrorIds.USER_ALREADY_EXISTS);
    }

    const createdUser = await this.userModel.create(createUserDto);
    try {
      return getUserSchema.parse(createdUser.toObject());
    } catch (error) {
      console.error("Error creating user:", error);
      await this.userModel.findByIdAndDelete(createdUser._id);
    }
  }

  public async findUserByEmail(email: string): Promise<GetUserDto> {
    const user = await this.userModel
      .findOne({ email })
      .select("-password")
      .lean();

    if (!user) {
      throw new NotFoundException(ErrorIds.USER_NOT_FOUND);
    }

    return getUserSchema.parse(user);
  }

  public async findUserById(id: string): Promise<GetUserDto> {
    const user = await this.userModel.findById(id).select("-password").lean();

    if (!user) {
      throw new NotFoundException(ErrorIds.USER_NOT_FOUND);
    }

    return getUserSchema.parse(user);
  }

  public async listAllUsers(): Promise<ListUsersDto> {
    return listUsersSchema.parse(
      await this.userModel.find().select("-password").lean(),
    );
  }

  public async removeUserByEmail(email: string): Promise<void> {
    if (!(await this.checkIfUserExists(email))) {
      throw new NotFoundException(ErrorIds.USER_NOT_FOUND);
    }

    await this.userModel.deleteOne({ email }).exec();
  }
}
