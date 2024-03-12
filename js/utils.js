export function getFormatedTime(totalSeconds) {
  const MINUTE_IN_SECONDS = 60;
  const minutes = String(Math.floor(totalSeconds / MINUTE_IN_SECONDS)).padStart(
    2,
    0
  );
  const seconds = String(totalSeconds - minutes * MINUTE_IN_SECONDS).padStart(
    2,
    0
  );
  return minutes + ":" + seconds;
}

export function getPercentage(a, b) {
  return Math.max(0, Math.min(Math.ceil((a / b) * 100), 100));
}
