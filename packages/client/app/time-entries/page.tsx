"use client";

import { select } from "d3";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { JSX } from "react";
import { listTaskEntries } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListTaskEntryDto } from "@tasks-estimate/shared";
import {
  addDaysLocal,
  buildDayRange,
  buildSlotStarts,
  buildTimeEntryBoxes,
  formatClockLabel,
  formatDayLabel,
  formatSlotLabel,
  parseDateInput,
  toDateInputValue,
} from "@/utils";
import { buildRenderableTimeEntryBoxes } from "./utils";

const MAX_CONSECUTIVE_DAYS = 14;
const DEFAULT_DAY_COUNT = 7;
const DEFAULT_INTERVAL_MINUTES = 15;
const DAY_COUNT_OPTIONS = Array.from(
  { length: MAX_CONSECUTIVE_DAYS },
  (_, index) => index + 1,
);
const INTERVAL_OPTIONS = [1, 5, 10, 15, 30, 60] as const;
const TIME_COLUMN_WIDTH_PX = 80;
const DAY_COLUMN_WIDTH_PX = 500;
const SLOT_ROW_HEIGHT_PX = 40;

/**
 * Time entries page with SVG timeline rendering.
 */
export default function TimeEntriesPage(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStart = searchParams?.get("start") ?? toDateInputValue(new Date());
  const initialDayCount = Number(searchParams?.get("days") ?? DEFAULT_DAY_COUNT) || DEFAULT_DAY_COUNT;

  const [startDate, setStartDate] = useState<string>(() => initialStart);
  const [dayCount, setDayCount] = useState<number>(initialDayCount);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(
    DEFAULT_INTERVAL_MINUTES,
  );

  const svgRef = useRef<SVGSVGElement | null>(null);

  const intervalIndex = INTERVAL_OPTIONS.indexOf(
    intervalMinutes as (typeof INTERVAL_OPTIONS)[number],
  );
  const canZoomIn = intervalIndex > 0;
  const canZoomOut =
    intervalIndex >= 0 && intervalIndex < INTERVAL_OPTIONS.length - 1;
  const zoomIn = () => {
    if (canZoomIn) {
      setIntervalMinutes(INTERVAL_OPTIONS[intervalIndex - 1]);
    }
  };
  const zoomOut = () => {
    if (canZoomOut) {
      setIntervalMinutes(INTERVAL_OPTIONS[intervalIndex + 1]);
    }
  };

  const entriesQuery = useQuery<ListTaskEntryDto[]>({
    queryKey: ["task-entries"],
    queryFn: async () => {
      const response = (await listTaskEntries()) as ListTaskEntryDto[];
      return response;
    },
  });

  const dayRange = useMemo(
    () => buildDayRange(startDate, Math.min(dayCount, MAX_CONSECUTIVE_DAYS)),
    [startDate, dayCount],
  );
  const slotStarts = useMemo(
    () => buildSlotStarts(intervalMinutes),
    [intervalMinutes],
  );

  // keep state in sync when user navigates with browser controls
  useEffect(() => {
    const spStart = searchParams?.get("start") ?? toDateInputValue(new Date());
    const spDays = Number(searchParams?.get("days") ?? DEFAULT_DAY_COUNT) || DEFAULT_DAY_COUNT;
    if (spStart !== startDate) setStartDate(spStart);
    if (spDays !== dayCount) setDayCount(spDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    try {
      const params = new URLSearchParams();
      params.set("start", startDate);
      params.set("days", String(dayCount));
      const url = `${globalThis.location.pathname}?${params.toString()}`;
      router.replace(url);
    } catch (e) {
      console.error("Failed to update URL with current timeline state", e);
    }
  }, [startDate, dayCount, router]);

  const rangeStart = dayRange[0] ?? parseDateInput(startDate);
  const rangeEnd = addDaysLocal(
    rangeStart,
    Math.min(dayCount, MAX_CONSECUTIVE_DAYS),
  );

  const timelineWidth = dayRange.length * DAY_COLUMN_WIDTH_PX;
  const timelineHeight = slotStarts.length * SLOT_ROW_HEIGHT_PX;

  const timeEntryBoxes = useMemo(
    () =>
      buildTimeEntryBoxes(entriesQuery.data ?? [], {
        dayRange,
        intervalMinutes,
        rangeStart,
        rangeEnd,
      }),
    [entriesQuery.data, dayRange, intervalMinutes, rangeStart, rangeEnd],
  );

  const renderTimeEntryBoxes = useMemo(
    () =>
      buildRenderableTimeEntryBoxes(
        timeEntryBoxes,
        timelineHeight,
        DAY_COLUMN_WIDTH_PX,
      ),
    [timeEntryBoxes, timelineHeight],
  );

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) {
      return;
    }

    const svg = select(svgNode);
    svg.selectAll("*").remove();

    svg
      .attr("width", timelineWidth)
      .attr("height", timelineHeight)
      .attr("viewBox", `0 0 ${timelineWidth} ${timelineHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet");

    const gridLayer = svg.append("g").attr("data-layer", "grid");
    const horizontalPositions = slotStarts.map(
      (slotStart) => (slotStart / intervalMinutes) * SLOT_ROW_HEIGHT_PX,
    );
    horizontalPositions.push(timelineHeight);

    gridLayer
      .selectAll("line.horizontal")
      .data(horizontalPositions)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", timelineWidth)
      .attr("y1", (position) => position)
      .attr("y2", (position) => position)
      .attr("stroke", "#e4e4e7")
      .attr("stroke-width", 1);

    const verticalPositions = Array.from(
      { length: dayRange.length + 1 },
      (_, index) => index * DAY_COLUMN_WIDTH_PX,
    );

    gridLayer
      .selectAll("line.vertical")
      .data(verticalPositions)
      .enter()
      .append("line")
      .attr("x1", (position) => position)
      .attr("x2", (position) => position)
      .attr("y1", 0)
      .attr("y2", timelineHeight)
      .attr("stroke", "#e4e4e7")
      .attr("stroke-width", 1);

    const entriesLayer = svg.append("g").attr("data-layer", "entries");

    for (const entryBox of renderTimeEntryBoxes) {
      const entryGroup = entriesLayer
        .append("g")
        .attr("transform", `translate(${entryBox.x},${entryBox.y})`)
        .attr("data-entry-id", entryBox.dto._id)
        .attr("data-continuation-of", entryBox.continuationOf ?? "");

      entryGroup
        .append("rect")
        .attr("width", entryBox.width)
        .attr("height", entryBox.height)
        .attr("fill", "#d1fae5")
        .attr("stroke", "#6ee7b7")
        .attr("stroke-width", 1)
        .attr("rx", 2)
        .attr("ry", 2);

      if (entryBox.isStart && entryBox.height >= 14) {
        entryGroup
          .append("text")
          .attr("x", 4)
          .attr("y", 3)
          .attr("dy", "0.9em")
          .attr("fill", "#065f46")
          .attr("font-size", 10)
          .attr("font-weight", 600)
          .text(entryBox.dto.taskTitle);

        if (entryBox.height >= 26) {
          entryGroup
            .append("text")
            .attr("x", 4)
            .attr("y", 15)
            .attr("dy", "0.9em")
            .attr("fill", "#065f46")
            .attr("font-size", 10)
            .text(
              `${formatClockLabel(entryBox.start)}- ${formatClockLabel(entryBox.end)}`,
            );
        }
      }
    }
  }, [
    dayRange.length,
    intervalMinutes,
    renderTimeEntryBoxes,
    slotStarts,
    timelineHeight,
    timelineWidth,
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4">
      <div className="mx-auto min-h-screen bg-white flex w-full max-w-7xl flex-col gap-4">
        <div className="grid gap-3 rounded p-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Start day
            <Input
              type="date"
              className="w-auto"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Consecutive days
            <Select
              value={String(dayCount)}
              onValueChange={(value) => setDayCount(Number(value))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_COUNT_OPTIONS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-center justify-end gap-2">
            <div className="text-sm text-zinc-600">Timeline</div>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={zoomOut}
              disabled={!canZoomOut}
            >
              −
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={zoomIn}
              disabled={!canZoomIn}
            >
              +
            </Button>
          </div>
        </div>

        {entriesQuery.isLoading ? (
          <div className="rounded bg-white p-4 text-sm text-zinc-600">
            Loading entries...
          </div>
        ) : null}

        {entriesQuery.isError ? (
          <div className="rounded p-4 text-sm text-red-700">
            Failed to load time entries.
          </div>
        ) : null}

        <div className="px-4">
          {!entriesQuery.isLoading && !entriesQuery.isError ? (
            <div className="rounded bg-white overflow-x-auto">
              <div className="min-w-max">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `${TIME_COLUMN_WIDTH_PX}px ${timelineWidth}px`,
                  }}
                >
                  <div
                    className="z-20 border border-zinc-200 bg-zinc-100 px-2 py-2 text-left font-medium"
                    style={{ width: `${TIME_COLUMN_WIDTH_PX}px` }}
                  >
                    <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                      <span>Time</span>
                    </div>
                  </div>

                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${dayRange.length}, ${DAY_COLUMN_WIDTH_PX}px)`,
                    }}
                  >
                    {dayRange.map((day) => (
                      <div
                        key={toDateInputValue(day)}
                        className="border border-zinc-200 bg-zinc-100 px-2 py-2 text-left text-xs font-medium"
                      >
                        {formatDayLabel(day)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-auto" style={{ maxHeight: `60vh` }}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `${TIME_COLUMN_WIDTH_PX}px ${timelineWidth}px`,
                    }}
                  >
                    <div
                      className="left-0 z-10"
                      style={{ width: `${TIME_COLUMN_WIDTH_PX}px` }}
                    >
                      {slotStarts.map((slotStart) => (
                        <div
                          key={slotStart}
                          className="border border-zinc-200 bg-zinc-50 px-2 py-1 text-left text-xs font-normal"
                          style={{
                            width: `${TIME_COLUMN_WIDTH_PX}px`,
                            height: `${SLOT_ROW_HEIGHT_PX}px`,
                          }}
                        >
                          {formatSlotLabel(slotStart)}
                        </div>
                      ))}
                    </div>

                    <div className="border-r border-b border-zinc-200 bg-white">
                      <svg
                        ref={svgRef}
                        className="block"
                        aria-label="Time entries timeline"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
