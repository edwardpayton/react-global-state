import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createSubscribedState from '../src';

type Obj = { [key: string]: number | Obj };

interface State {
  count: number;
  obj: Obj;
}

const initialState: State = {
  count: 0,
  obj: {
    aa: 1,
    bb: {
      cc: 2,
    },
  },
};

const subscribedState = createSubscribedState<State>(initialState);

function Count() {
  let [{ count }, setState] = subscribedState();

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
  let [state, setState] = subscribedState();

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
  const [state] = subscribedState();

  return <p>state:{JSON.stringify(state)}</p>;
}
function JustObj() {
  const [{ obj, count }, setState] = subscribedState(['obj']);

  const logit = () => console.log('example/index >>>', count);

  return (
    <p>
      <button onClick={() => setState({ count: count + 1 })}>+</button>
      obj:{JSON.stringify(obj)} <br />
      count is also available:{count} but doesnt update on change
      <button onClick={logit}>Log count</button>
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
