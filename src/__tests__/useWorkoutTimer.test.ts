import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';

jest.useFakeTimers();

describe('useWorkoutTimer', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('starts at 0 elapsed time', () => {
    const { result } = renderHook(() => useWorkoutTimer(false));
    expect(result.current.elapsed).toBe(0);
  });

  it('is not running when autoStart is false', () => {
    const { result } = renderHook(() => useWorkoutTimer(false));
    expect(result.current.isRunning).toBe(false);
  });

  it('increments elapsed every second when running', () => {
    const { result } = renderHook(() => useWorkoutTimer(true));
    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.elapsed).toBe(3);
  });

  it('stops incrementing after pause()', () => {
    const { result } = renderHook(() => useWorkoutTimer(true));
    act(() => { jest.advanceTimersByTime(2000); });
    act(() => { result.current.pause(); });
    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.elapsed).toBe(2);
    expect(result.current.isRunning).toBe(false);
  });

  it('resumes incrementing after start()', () => {
    const { result } = renderHook(() => useWorkoutTimer(false));
    act(() => { result.current.start(); });
    act(() => { jest.advanceTimersByTime(5000); });
    expect(result.current.elapsed).toBe(5);
    expect(result.current.isRunning).toBe(true);
  });

  it('resets elapsed to 0 on reset()', () => {
    const { result } = renderHook(() => useWorkoutTimer(true));
    act(() => { jest.advanceTimersByTime(10000); });
    expect(result.current.elapsed).toBe(10);
    act(() => { result.current.reset(); });
    expect(result.current.elapsed).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('lap() returns elapsed since last lap', () => {
    const { result } = renderHook(() => useWorkoutTimer(true));
    act(() => { jest.advanceTimersByTime(5000); });
    const lapTime = result.current.lap();
    expect(lapTime).toBe(5);
    act(() => { jest.advanceTimersByTime(3000); });
    const lapTime2 = result.current.lap();
    expect(lapTime2).toBe(3);
  });
});
