import { renderHook, cleanup } from '@testing-library/react-hooks';
import createGlobalState, { SubscribedState, State, SetState } from '../src';

describe('it', () => {
  let useSubscribedState: SubscribedState;
  let state: State;
  let setState: SetState;

  beforeAll(() => {
    useSubscribedState = createGlobalState({ count: 1, obj: { abc: 'xyz' } });
  });

  afterAll(() => cleanup());

  it('renders without crashing', () => {
    renderHook(() => ([state, setState] = useSubscribedState()));

    expect(state).toEqual({ count: 1, obj: { abc: 'xyz' } });
    console.log(
      'TODO -  this log is to stop TS complaining about setState being unused',
      typeof setState
    );
  });

  test.todo('write full tests');
});
