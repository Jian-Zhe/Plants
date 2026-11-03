let openModalsCount = 0;
let lastModalClosedAt = 0;

/**
 * Register when a modal is opened, returning an unregister callback for when it closes.
 * This guarantees that while any modal is mounted/open, background plant cards can NEVER be clicked.
 */
export function registerModalOpen(): () => void {
  openModalsCount++;
  return () => {
    openModalsCount = Math.max(0, openModalsCount - 1);
    lastModalClosedAt = Date.now();
  };
}

/**
 * Record timestamp whenever a modal, dialog, or dropdown is dismissed
 */
export function notifyModalClosed(): void {
  lastModalClosedAt = Date.now();
}

/**
 * Checks if a modal is currently open or was recently closed within the cooldown window (e.g. 600ms).
 * Completely prevents touch ghost clicks, event bleed-through, and accidental card clicks.
 */
export function isAnyModalActive(cooldownMs = 600): boolean {
  if (openModalsCount > 0) return true;
  return Date.now() - lastModalClosedAt < cooldownMs;
}

/**
 * Backward compatibility alias for isAnyModalActive
 */
export function isModalClosingCooldown(cooldownMs = 600): boolean {
  return isAnyModalActive(cooldownMs);
}
