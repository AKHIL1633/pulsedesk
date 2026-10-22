/** Standard error body returned by every endpoint. */
export function renderError(message: string, details?: unknown) {
  return details === undefined ? { error: message } : { error: message, details };
}
