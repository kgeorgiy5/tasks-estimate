import { ErrorDto } from "../dto/shared/error.dto";
import { ErrorIds } from "../config/error-ids.config";

type Translator = (key: string) => string;

/**
 * Normalize various message shapes into a single string for UI display.
 * @param msg unknown message payload
 */
function normalizeMessage(msg: unknown): string {
  if (typeof msg === "string") {
    return msg;
  }

  if (Array.isArray(msg)) {
    return msg.join(" ");
  }

  if (msg && typeof msg === "object") {
    try {
      return JSON.stringify(msg);
    } catch {
      return "An error occurred";
    }
  }

  try {
    return String(msg);
  } catch {
    return "An error occurred";
  }
}

/**
 * Parse an API or thrown error and return a user-facing message.
 *
 * The function detects known `ErrorIds` values and maps them to readable
 * English messages by default. A translation function can be provided to
 * integrate localization later.
 * @param response unknown error or API response
 * @param t optional translator function (receives ErrorId)
 */
export function parseErrorCode(response: unknown, t?: Translator): string {
  const defaultTranslate: Translator = (key) => {
    const map: Record<ErrorIds, string> = {
      [ErrorIds.USER_ALREADY_EXISTS]: "A user with this email already exists.",
      [ErrorIds.USER_NOT_FOUND]: "User not found.",
      [ErrorIds.GENERIC_BAD_REQUEST]: "Invalid request.",
      [ErrorIds.WRONG_OBJECT_ID_FORMAT]: "Invalid identifier format.",
      [ErrorIds.WRONG_EMAIL_FORMAT]: "Email format is invalid.",
      [ErrorIds.WRONG_PASSWORD_LENGTH]: "Password length is invalid.",
      [ErrorIds.WRONG_USER_LIST_FORMAT]: "Invalid users list format.",
      [ErrorIds.NOT_AUTHENTICATED]: "You must be signed in to perform this action.",
      [ErrorIds.NOT_AUTHORIZED]: "You are not authorized to perform this action.",
      [ErrorIds.FAILED_TO_DELETE_RESOURCE]: "Failed to delete the resource.",
      [ErrorIds.FAILED_TO_UPDATE_RESOURCE]: "Failed to update the resource.",
      [ErrorIds.RESOURCE_NOT_FOUND]: "Requested resource was not found.",
    } as const;

    return map[key as ErrorIds] ?? String(key);
  };

  const translate = t ?? defaultTranslate;


  // extract raw message(s) from common shapes
  let raw: string | undefined;

  // ErrorDto shape
  if (response && typeof response === "object" && "message" in (response as any)) {
    const dto = response as ErrorDto | Record<string, unknown>;
    raw = normalizeMessage(dto.message);
  }

  // thrown Error or string
  if (!raw) {
    if (response instanceof Error && response.message) raw = response.message;
    else if (typeof response === "string") raw = response;
  }

  if (!raw) {
    return "An unexpected error occurred";
  }

  // try to find a known ErrorId in the message
  const ids = Object.values(ErrorIds) as string[];
  const found = ids.find((id) => raw.includes(id));
  if (found) {
    return translate(found);
  }

  return raw;
}
