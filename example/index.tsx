import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createSubscribedStore from '../src';

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

const subscribedState = createSubscribedStore<State>(initialState);

function Standard() {
  let [{ count }, setState] = subscribedState();

  return (
    <div>
      Counter
      <button onClick={() => setState({ count: count - 1 })}>dec</button>
      <button onClick={() => setState({ count: count + 1 })}>inc</button>
      <br />
      Object
      <button onClick={() => setState({ obj: { bb: { cc: 3 } } })}>
        obj.bb.cc = 3
      </button>
    </div>
  );
}
function Breaking() {
  const [state, setState] = subscribedState();

  return (
    <div>
      Convert 'obj' to a number{' '}
      <button onClick={() => setState({ obj: 1 }, false)}>convert</button>
      {typeof state.obj === 'number' && (
        <span>now obj has been converted, 'obj.bb.cc' button will error</span>
      )}
      <br />
      Try to add a key that doesn't exist
      <button onClick={() => setState({ keyMissing: 1 })}>attempt</button>
    </div>
  );
}
function ScopedToObj() {
  const [{ count }, setState] = subscribedState(['obj']);

  return (
    <div>
      Count
      <button onClick={() => setState({ count: count + 1 })}>
        inc will not happen
      </button>
    </div>
  );
}
function Display() {
  const [state] = subscribedState();

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <pre>
              initial state:
              {JSON.stringify(initialState, null, 2)}
            </pre>
          </td>
          <td>
            <pre>
              current state:
              {JSON.stringify(state, null, 2)}
            </pre>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
function App() {
  return (
    <>
      <Standard />
      <Breaking />
      <ScopedToObj />
      <Display />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
