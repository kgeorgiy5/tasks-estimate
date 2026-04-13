import { PopulatedTaskTitle } from "./populated-task-title";
import { ProjectRef } from "./project-ref";

export type PopulatedTask = PopulatedTaskTitle & {
  projectId?: ProjectRef;
};
