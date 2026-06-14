import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StatBadge } from '../components/common/StatBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

describe('StatBadge', () => {
  it('renders the value and label', () => {
    render(<StatBadge label="Duration" value="42m" />);
    expect(screen.getByText('42m')).toBeTruthy();
    expect(screen.getByText('Duration')).toBeTruthy();
  });

  it('renders with a custom color without crashing', () => {
    expect(() =>
      render(<StatBadge label="Volume" value="1200 kg" color="#10B981" />)
    ).not.toThrow();
  });
});

describe('EmptyState', () => {
  it('renders title and subtitle', () => {
    render(
      <EmptyState
        title="No workouts yet"
        subtitle="Start logging your workouts."
        icon="🏋️"
      />
    );
    expect(screen.getByText('No workouts yet')).toBeTruthy();
    expect(screen.getByText('Start logging your workouts.')).toBeTruthy();
  });

  it('renders action button when actionLabel and onAction provided', () => {
    const mockAction = jest.fn();
    render(
      <EmptyState
        title="Empty"
        actionLabel="Get Started"
        onAction={mockAction}
      />
    );
    expect(screen.getByText('Get Started')).toBeTruthy();
  });

  it('calls onAction when button is pressed', () => {
    const mockAction = jest.fn();
    render(
      <EmptyState
        title="Empty"
        actionLabel="Start"
        onAction={mockAction}
      />
    );
    fireEvent.press(screen.getByText('Start'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('does not render a button when actionLabel is not provided', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Save" onPress={() => {}} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button label="Tap me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator instead of label when isLoading', () => {
    render(<Button label="Save" onPress={() => {}} isLoading />);
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Disabled" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Disabled'));
    // disabled buttons won't invoke the handler
    expect(onPress).not.toHaveBeenCalled();
  });
});
