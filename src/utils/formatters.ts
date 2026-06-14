// ─── Time & Date Utilities ────────────────────────────────────────────────────

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(isoString);
};

export const getWeekStart = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay();
  // Week starts on Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

// ─── Number & Volume Utilities ────────────────────────────────────────────────

export const formatWeight = (kg: number): string => {
  if (kg === 0) return 'BW'; // bodyweight
  return `${kg} kg`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
  return `${volume} kg`;
};

export const calculateVolume = (weight: number, reps: number): number => {
  return weight * reps;
};

export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
};

// ─── ID Generation ────────────────────────────────────────────────────────────

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const isValidWeight = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 1000;
};

export const isValidReps = (value: string): boolean => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && num <= 1000;
};

// ─── Array Utilities ──────────────────────────────────────────────────────────

export const groupByDate = <T extends { date: string }>(items: T[]): Record<string, T[]> => {
  return items.reduce(
    (groups, item) => {
      const date = item.date.split('T')[0];
      return { ...groups, [date]: [...(groups[date] ?? []), item] };
    },
    {} as Record<string, T[]>
  );
};
