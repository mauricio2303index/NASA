export function observationFreshness(date, now = new Date(), maximumDays = 5) {
  const timestamp = Date.parse(date + 'T00:00:00Z');
  if (!Number.isFinite(timestamp) || timestamp > now.getTime()) {
    return { status: 'unknown', ageDays: null };
  }
  const ageDays = Math.floor((now.getTime() - timestamp) / 86400000);
  return { status: ageDays > maximumDays ? 'outdated' : 'withinOperationalWindow', ageDays };
}
