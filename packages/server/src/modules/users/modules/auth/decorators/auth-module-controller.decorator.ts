import { UsersModuleController } from "@/modules/users/decorators";
import { PathsUtil } from "@tasks-estimate/shared";

export const AuthModuleController = (prefix?: string) => {
  return UsersModuleController(PathsUtil.buildPath("auth", prefix));
};
