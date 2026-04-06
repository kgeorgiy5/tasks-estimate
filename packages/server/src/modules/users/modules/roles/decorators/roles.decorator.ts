import { SetMetadata } from "@nestjs/common";
import { Role } from "@tasks-estimate/shared";

export const UseRoles = (...roles: Role[]) => SetMetadata("roles", roles);
