import { ComponentState } from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import createGlobalState, {
  SubscribedState,
} from '../src/hooks/createSubscribedState';

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

  it('does not increase count when using scope', () => {
    renderHook(() => ([state, setState] = useSubscribedState(['obj'])));
    act(() => {
      // state.count is already 2 before this setState
      setState({ count: state.count + 1 });
    });

    expect(state.count).toBe(2);
  });

  it('errors when state key is not found', () => {
    // TODO not working
    act(() => {
      setState({ wrongKey: 1 });
    });

    expect(state).toEqual(initialState);
  });

  test.todo('test for setting a deep state & type checking');
});
