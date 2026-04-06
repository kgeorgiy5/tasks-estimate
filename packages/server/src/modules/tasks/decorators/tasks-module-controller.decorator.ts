import { applyDecorators, Controller } from "@nestjs/common";
import { PathsUtil } from "@tasks-estimate/shared";

export const TasksModuleController = (prefix?: string) => {
  return applyDecorators(Controller(PathsUtil.buildPath("tasks", prefix)));
};
