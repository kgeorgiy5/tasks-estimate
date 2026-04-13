import type { ListTaskEntryDto } from "@tasks-estimate/shared";

type EntryRange = {
  dto: ListTaskEntryDto;
  start: Date;
  end: Date;
};

/**
 * Converts a date to yyyy-mm-dd for date input controls.
 */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses yyyy-mm-dd into a local midnight Date.
 */
export function parseDateInput(value: string): Date {
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date();
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Returns a new Date shifted by a number of days.
 */
export function addDaysLocal(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Returns a new Date shifted by a number of minutes.
 */
export function addMinutesLocal(date: Date, minutes: number): Date {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

/**
 * Builds a contiguous local day range from a start date and count.
 */
export function buildDayRange(startDateValue: string, dayCount: number): Date[] {
  const start = parseDateInput(startDateValue);
  return Array.from({ length: dayCount }, (_, index) => addDaysLocal(start, index));
}

/**
 * Builds minute offsets across one day using a fixed interval.
 */
export function buildSlotStarts(intervalMinutes: number): number[] {
  const starts: number[] = [];
  for (let minute = 0; minute < 24 * 60; minute += intervalMinutes) {
    starts.push(minute);
  }
  return starts;
}

/**
 * Formats a minute offset as HH:MM.
 */
export function formatSlotLabel(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formats a day header as weekday and date.
 */
export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

/**
 * Formats a Date value as HH:MM.
 */
export function formatClockLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Returns true when two time intervals overlap.
 */
export function overlapsInterval(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Converts a DTO into a normalized entry range.
 */
export function toEntryRange(dto: ListTaskEntryDto): EntryRange | null {
  const start = new Date(dto.startDateTime);
  const endCandidate = dto.endDateTime ? new Date(dto.endDateTime) : new Date();

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(endCandidate.getTime())) {
    return null;
  }

  const end = endCandidate > start ? endCandidate : start;
  return { dto, start, end };
}

/**
 * Finds all entries overlapping a specific grid cell.
 */
export function findEntriesForCell(
  cellStart: Date,
  cellEnd: Date,
  ranges: EntryRange[],
): EntryRange[] {
  return ranges.filter((range) => overlapsInterval(range.start, range.end, cellStart, cellEnd));
}

/**
 * Returns true when an entry starts within the current grid cell.
 */
export function isEntryStartCell(entryStart: Date, cellStart: Date, cellEnd: Date): boolean {
  return entryStart >= cellStart && entryStart < cellEnd;
}

/**
 * A clipped and positioned time entry box to render inside the day timeline.
 */
export type TimeEntryBox = {
  dto: ListTaskEntryDto;
  start: Date;
  end: Date;
  dayIndex: number;
  laneIndex: number;
  laneCount: number;
  isStart: boolean;
  continuationOf?: string;
};

type TimeEntryBoxDraft = {
  dto: ListTaskEntryDto;
  start: Date;
  end: Date;
  dayIndex: number;
  isStart: boolean;
  continuationOf?: string;
  laneIndex: number;
};

/**
 * Configuration used to build renderable time-entry boxes.
 */
export type BuildTimeEntryBoxesConfig = {
  dayRange: Date[];
  intervalMinutes: number;
  rangeStart: Date;
  rangeEnd: Date;
};

/**
 * Clips a range to a visible window.
 */
function clipRangeToWindow(
  start: Date,
  end: Date,
  rangeStart: Date,
  rangeEnd: Date,
): { start: Date; end: Date } | null {
  const clippedStart = start > rangeStart ? start : rangeStart;
  const clippedEnd = end < rangeEnd ? end : rangeEnd;

  if (clippedEnd <= clippedStart) {
    return null;
  }

  return { start: clippedStart, end: clippedEnd };
}

/**
 * Splits a clipped entry into per-day fragments and crops each fragment to day bounds.
 */
function splitEntryByDay(
  dto: ListTaskEntryDto,
  clippedStart: Date,
  clippedEnd: Date,
  dayRange: Date[],
): TimeEntryBoxDraft[] {
  const drafts: TimeEntryBoxDraft[] = [];

  for (let dayIndex = 0; dayIndex < dayRange.length; dayIndex += 1) {
    const dayStart = dayRange[dayIndex];
    const dayEnd = addDaysLocal(dayStart, 1);
    const partStart = clippedStart > dayStart ? clippedStart : dayStart;
    const partEnd = clippedEnd < dayEnd ? clippedEnd : dayEnd;

    if (partEnd <= partStart) {
      continue;
    }

    drafts.push({
      dto,
      start: partStart,
      end: partEnd,
      dayIndex,
      isStart: partStart.getTime() === clippedStart.getTime(),
      continuationOf: partStart.getTime() === clippedStart.getTime() ? undefined : dto._id,
      laneIndex: 0,
    });
  }

  return drafts;
}

/**
 * Assigns horizontal lane indexes per day so intersecting entries stack side by side.
 */
function assignLaneIndexesByDay(drafts: TimeEntryBoxDraft[]): TimeEntryBox[] {
  const byDay = new Map<number, TimeEntryBoxDraft[]>();

  for (const draft of drafts) {
    const existing = byDay.get(draft.dayIndex) ?? [];
    existing.push(draft);
    byDay.set(draft.dayIndex, existing);
  }

  const boxes: TimeEntryBox[] = [];

  for (const [, dayDrafts] of byDay) {
    const sortedDrafts = [...dayDrafts].sort((a, b) => {
      if (a.start.getTime() !== b.start.getTime()) {
        return a.start.getTime() - b.start.getTime();
      }
      return a.end.getTime() - b.end.getTime();
    });

    const laneEnds: Date[] = [];

    for (const draft of sortedDrafts) {
      let laneIndex = -1;

      for (let index = 0; index < laneEnds.length; index += 1) {
        if (draft.start >= laneEnds[index]) {
          laneIndex = index;
          break;
        }
      }

      if (laneIndex === -1) {
        laneIndex = laneEnds.length;
        laneEnds.push(draft.end);
      } else {
        laneEnds[laneIndex] = draft.end;
      }

      draft.laneIndex = laneIndex;
    }

    const laneCount = laneEnds.length > 0 ? laneEnds.length : 1;

    for (const draft of sortedDrafts) {
      boxes.push({
        dto: draft.dto,
        start: draft.start,
        end: draft.end,
        dayIndex: draft.dayIndex,
        laneIndex: draft.laneIndex,
        laneCount,
        isStart: draft.isStart,
        continuationOf: draft.continuationOf,
      });
    }
  }

  return boxes;
}

/**
 * Builds renderable entry boxes from backend entries and visible-range configuration.
 */
export function buildTimeEntryBoxes(
  entries: ListTaskEntryDto[],
  config: BuildTimeEntryBoxesConfig,
): TimeEntryBox[] {
  if (!Number.isFinite(config.intervalMinutes) || config.intervalMinutes <= 0) {
    return [];
  }

  const drafts: TimeEntryBoxDraft[] = [];

  for (const dto of entries) {
    const range = toEntryRange(dto);
    if (!range) {
      continue;
    }

    const clipped = clipRangeToWindow(
      range.start,
      range.end,
      config.rangeStart,
      config.rangeEnd,
    );

    if (!clipped) {
      continue;
    }

    drafts.push(...splitEntryByDay(dto, clipped.start, clipped.end, config.dayRange));
  }

  return assignLaneIndexesByDay(drafts);
}

export type { EntryRange };
