import { Body, Get, Param, Post } from "@nestjs/common";
import { UsersModuleController } from "./decorators";
import { UsersService } from "./users.service";
import { ZodValidationPipe } from "../../pipes/";
import { CreateUserDto, createUserSchema } from "@tasks-estimate/shared";

@UsersModuleController()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/list")
  public async listAllUsers() {
    return this.usersService.listAllUsers();
  }

  @Post("/create")
  public async createUser(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    return await this.usersService.createUser(createUserDto);
  }

  @Get("/email/:email")
  public async findUserByEmail(@Param("email") email: string) {
    return await this.usersService.findUserByEmail(email);
  }

  @Get("/id/:id")
  public async findUserById(@Param("id") id: string) {
    return await this.usersService.findUserById(id);
  }
}
