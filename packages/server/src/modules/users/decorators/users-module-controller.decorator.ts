import { applyDecorators, Controller } from "@nestjs/common";
import { PathsUtil } from "@tasks-estimate/shared";

export const UsersModuleController = (prefix?: string) => {
  return applyDecorators(Controller(PathsUtil.buildPath("users", prefix)));
};
