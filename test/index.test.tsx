import { ComponentState } from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import createGlobalState, { SubscribedState } from '../src';

const initialState = { count: 1, obj: { abc: 'xyz' } };

describe('createSubscribedState', () => {
  let state: ComponentState; // any but with a clearer intent
  let setState: (newState: any, typeSafe?: boolean) => void;
  let useSubscribedState: SubscribedState<typeof initialState>;

  beforeEach(() => {
    useSubscribedState = createGlobalState(initialState);
    renderHook(() => ([state, setState] = useSubscribedState()));
  });

  afterEach(cleanup);

  it('renders with the initial State', () => {
    expect(state).toEqual(initialState);
  });

  it('sets the state', () => {
    act(() => {
      setState({ count: state.count + 1 });
    });

    expect(state.count).toBe(2);
  });

  it('converts the state object to a new type', () => {
    // expect an error with typeSafe true (default)
    try {
      act(() => {
        setState({ count: '' });
      });
    } catch (e) {
      expect(e.message).toMatch(
        'type of "count" was transformed from "number" to "string". If this was intentional add true as a second argument to your setState function'
      );
    }

    // expect success with typeSafe false
    act(() => {
      setState({ count: '' }, false);
    });
    expect(state.count).toBe('');
  });

  it('does not increase count when using scope', () => {
    renderHook(() => ([state, setState] = useSubscribedState(['obj'])));
    act(() => {
      setState({ count: state.count + 1 });
    });

    expect(state.count).toBe(1);
  });

  it('errors when state key is not found', () => {
    try {
      act(() => {
        setState({ wrongKey: 1 });
      });
    } catch (e) {
      expect(e.message).toMatch('key "wrongKey" is not found on state object');
    }
  });

  test.todo('test for setting a deep state & type checking');
});
