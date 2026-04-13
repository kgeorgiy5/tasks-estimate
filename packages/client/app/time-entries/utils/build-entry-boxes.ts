import { TimeEntryBox } from "@/utils";
import { scaleLinear } from "d3";
import { toMinutesSinceDayStart } from "../utils";

export type RenderTimeEntryBox = TimeEntryBox & {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Builds render geometry for each clipped entry box.
 */
export function buildRenderableTimeEntryBoxes(
  timeEntryBoxes: TimeEntryBox[],
  timelineHeight: number,
  dayColumnWidthPx: number,
): RenderTimeEntryBox[] {
  const yScale = scaleLinear<number, number>()
    .domain([0, 24 * 60])
    .range([0, timelineHeight]);

  return timeEntryBoxes.map((timeEntryBox) => {
    const dayX = timeEntryBox.dayIndex * dayColumnWidthPx;
    const laneWidth = dayColumnWidthPx / timeEntryBox.laneCount;
    const x = dayX + timeEntryBox.laneIndex * laneWidth + 1;
    const yStart = yScale(toMinutesSinceDayStart(timeEntryBox.start));
    const yEnd = yScale(toMinutesSinceDayStart(timeEntryBox.end));

    return {
      ...timeEntryBox,
      x,
      y: yStart,
      width: Math.max(4, laneWidth - 2),
      height: Math.max(2, yEnd - yStart),
    };
  });
}
