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
