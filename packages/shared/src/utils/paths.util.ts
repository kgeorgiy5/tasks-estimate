export class PathsUtil {
  public static buildPath(...segments: (string | number | undefined)[]) {
    return segments
      .filter((segment): segment is string | number => segment !== undefined)
      .map((segment) =>
        segment
          .toString()
          .trim()
          .replace(/(?:^\/+|\/+$)/g, ""),
      )
      .filter((segment) => segment.length > 0)
      .join("/");
  }
}
