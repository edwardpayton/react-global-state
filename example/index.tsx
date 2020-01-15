import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createGlobalState from '../src';

interface State {
  count: number;
  func: (arg: any) => void;
  obj: { aa: number; bb: number };
}

const initialState: State = {
  count: 0,
  func: arg => {
    console.log('current count:', arg);
  },
  obj: {
    aa: 1,
    bb: 2,
  },
};

const useSubscribedState = createGlobalState(initialState);

function Count() {
  let [{ count }, setState] = useSubscribedState();

  return (
    <div>
      Counter
      <button onClick={() => setState({ count: count - 1 })}>-</button>
      <span>{count}</span>
      <button onClick={() => setState({ count: count + 1 })}>+</button>
    </div>
  );
}
function Obj() {
  let [state, setState] = useSubscribedState();

  return (
    <div>
      Set Obj
      <button onClick={() => setState({ obj: { bb: { cc: 2 } } }, false)}>
        bb
      </button>
      <span>{JSON.stringify(state.obj)}</span>
    </div>
  );
}
function Display() {
  const [state] = useSubscribedState();

  return (
    <p>
      count:{state.count} <br />
      obj:{JSON.stringify(state.obj)}
    </p>
  );
}
function JustObj() {
  const [{ obj, func, count }] = useSubscribedState(['obj']);

  return (
    <p>
      obj:{JSON.stringify(obj)} <br />
      count is also available:{count} but doesnt update on change
      <button onClick={() => func(count)}>Log count</button>
    </p>
  );
}
function App() {
  return (
    <>
      <Count />
      <Obj />
      <Display />
      <JustObj />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
