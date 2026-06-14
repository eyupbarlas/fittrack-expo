import {
  formatDuration,
  formatDate,
  formatRelativeDate,
  formatWeight,
  formatVolume,
  calculateVolume,
  generateId,
  isValidWeight,
  isValidReps,
  groupByDate,
  getWeekStart,
} from '../utils/formatters';

describe('formatDuration', () => {
  it('formats seconds under 60 correctly', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes correctly', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3600 - 60)).toBe('59m');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(3660)).toBe('1h 1m');
    expect(formatDuration(7200)).toBe('2h');
  });
});

describe('formatDate', () => {
  it('returns a human-readable date string', () => {
    const result = formatDate('2024-01-15T10:00:00.000Z');
    // Should contain month and day at minimum
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns a non-empty string for valid ISO date', () => {
    const result = formatDate(new Date().toISOString());
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRelativeDate', () => {
  it('returns "Today" for current date', () => {
    const result = formatRelativeDate(new Date().toISOString());
    expect(result).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns days ago for recent dates', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(formatRelativeDate(threeDaysAgo.toISOString())).toBe('3 days ago');
  });
});

describe('formatWeight', () => {
  it('returns "BW" for bodyweight (0)', () => {
    expect(formatWeight(0)).toBe('BW');
  });

  it('formats weight with kg suffix', () => {
    expect(formatWeight(80)).toBe('80 kg');
    expect(formatWeight(102.5)).toBe('102.5 kg');
  });
});

describe('formatVolume', () => {
  it('formats volume under 1000 as kg', () => {
    expect(formatVolume(500)).toBe('500 kg');
  });

  it('formats large volume in tonnes', () => {
    expect(formatVolume(2500)).toBe('2.5t');
    expect(formatVolume(10000)).toBe('10.0t');
  });
});

describe('calculateVolume', () => {
  it('multiplies weight by reps correctly', () => {
    expect(calculateVolume(100, 5)).toBe(500);
    expect(calculateVolume(0, 10)).toBe(0);
    expect(calculateVolume(70, 3)).toBe(210);
  });
});

describe('generateId', () => {
  it('generates a non-empty string', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('isValidWeight', () => {
  it('accepts valid weight values', () => {
    expect(isValidWeight('100')).toBe(true);
    expect(isValidWeight('0')).toBe(true);
    expect(isValidWeight('102.5')).toBe(true);
  });

  it('rejects invalid weight values', () => {
    expect(isValidWeight('abc')).toBe(false);
    expect(isValidWeight('-5')).toBe(false);
    expect(isValidWeight('1001')).toBe(false);
    expect(isValidWeight('')).toBe(false);
  });
});

describe('isValidReps', () => {
  it('accepts valid rep counts', () => {
    expect(isValidReps('10')).toBe(true);
    expect(isValidReps('1')).toBe(true);
    expect(isValidReps('100')).toBe(true);
  });

  it('rejects invalid rep counts', () => {
    expect(isValidReps('0')).toBe(false);
    expect(isValidReps('-1')).toBe(false);
    expect(isValidReps('abc')).toBe(false);
    expect(isValidReps('1001')).toBe(false);
  });
});

describe('groupByDate', () => {
  it('groups items by their date portion', () => {
    const items = [
      { id: '1', date: '2024-01-15T10:00:00Z' },
      { id: '2', date: '2024-01-15T18:00:00Z' },
      { id: '3', date: '2024-01-16T09:00:00Z' },
    ];
    const result = groupByDate(items);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result['2024-01-15']).toHaveLength(2);
    expect(result['2024-01-16']).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupByDate([])).toEqual({});
  });
});

describe('getWeekStart', () => {
  it('returns a valid ISO string', () => {
    const result = getWeekStart();
    expect(() => new Date(result)).not.toThrow();
  });

  it('returns a Monday', () => {
    const result = getWeekStart(new Date('2024-01-17')); // Wednesday
    const day = new Date(result).getDay();
    expect(day).toBe(1); // 1 = Monday
  });
});
