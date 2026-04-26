"use client";

import type { TimeEntryBox as TimeEntryBoxModel } from "@/utils";
import { formatClockLabel } from "@/utils";
import { FC } from "react";
import { useT } from "@/i18n";

type TimeEntryBoxProps = {
  timeEntryBox: TimeEntryBoxModel;
};

/**
 * Renders one visual box segment for a task time entry.
 */
export const TimeEntryBox: FC<TimeEntryBoxProps> = ({ timeEntryBox }) => {
  const { t } = useT();
  const showLabels = !timeEntryBox.continuationOf && timeEntryBox.isStart;

  return (
    <div
      data-entry-id={timeEntryBox.dto._id}
      data-continuation-of={timeEntryBox.continuationOf}
      className="min-w-30 h-full min-h-full truncate text-[10px] font-medium text-emerald-900 bg-emerald-100 px-1 flex flex-col justify-center border-l border-r border-emerald-200"
    >
      {showLabels ? (
        <>
          <div className="truncate">{timeEntryBox.dto.taskTitle}</div>
          <div>
            {t("TIME_ENTRY_BOX.RANGE", {
              start: formatClockLabel(timeEntryBox.start),
              end: formatClockLabel(timeEntryBox.end),
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};
