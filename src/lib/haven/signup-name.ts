/**
 * The name typed at sign-up, handed to the on-device identity. The server
 * account stores no name, so this is the only path the name takes.
 */
const KEY = "haven-signup-name";

export function rememberSignupName(name: string): void {
  try {
    if (name) window.localStorage.setItem(KEY, name);
  } catch {
    /* storage unavailable — the setup screen still asks for a name */
  }
}

/** The remembered name, or "" when there is none. */
export function readSignupName(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** Forget the name once the on-device identity has it. */
export function clearSignupName(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
