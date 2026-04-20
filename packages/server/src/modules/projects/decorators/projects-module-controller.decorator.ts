import { applyDecorators, Controller } from "@nestjs/common";
import { PathsUtil } from "@tasks-estimate/shared";

export const ProjectsModuleController = (prefix?: string) => {
  return applyDecorators(Controller(PathsUtil.buildPath("projects", prefix)));
};
