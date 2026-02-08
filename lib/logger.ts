type LogDetails = Record<string, unknown> | undefined;

export function logServerError(scope: string, error: unknown, details?: LogDetails) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[${scope}] ${message}`, {
    details,
    stack,
  });
}

export function logAdminAction(action: string, details?: LogDetails) {
  console.info(`[admin-action] ${action}`, details);
}
