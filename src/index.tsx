import {
  ComponentState,
  useState,
  useRef,
  useCallback,
  useEffect,
  useDebugValue,
} from 'react';

export type State = ComponentState; // any but with a clearer intent
export type Listener = (newState: State) => void;
export type SetState = (newState: State, typeSafe?: boolean) => void;
export type SubscribedState = (
  scope?: string[],
  typeSafe?: boolean
) => [State, SetState];

function mergeObjects(
  original: State,
  updates: Partial<State>,
  typeSafe = true
) {
  const isObject = (obj: unknown) => obj && typeof obj === 'object';
  if (!isObject(original) || !isObject(updates)) return updates;

  Object.keys(updates).forEach(key => {
    if (Array.isArray(original[key]) && Array.isArray(updates[key])) {
      return (original[key] = original[key].concat(updates[key]));
    } else if (isObject(original[key]) && isObject(updates[key])) {
      return (original[key] = mergeObjects(
        Object.assign({}, original[key]),
        updates[key],
        typeSafe
      ));
    }

    if (typeSafe && typeof original[key] !== typeof updates[key])
      throw new Error(
        `Error updating the state. "${key}" was transformed from "${typeof original[
          key
        ]}" to "${typeof updates[key]}"`
      );

    return (original[key] = updates[key]);
  });

  return original;
}

export default function(initialState: State): SubscribedState {
  let state: State = initialState || {};
  let listener: Listener[] = [];
  const subscribe = (fn: Listener) => listener.push(fn);
  const unsubscribe = (fn: Listener) =>
    (listener = listener.filter(f => f !== fn));

  return function useHook(scope = []) {
    // note:  the name 'useHook' is not needed or used anywhere,
    // but the callback function needs a name because of rules of hooks
    // https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
    // when consuming the hook in an app, the name can be anything
    // eg const [state, setState] = useMyCreatedState()
    const [, set] = useState();
    const refMounted = useRef(true);

    const setState = useCallback((newState: State, typeSafe?: boolean) => {
      state =
        typeof newState === 'object'
          ? mergeObjects(state, newState, typeSafe)
          : newState;
      listener.forEach(fn => fn(newState));
    }, []);

    useEffect(() => {
      const updater = (nextState: State) => {
        Object.keys(nextState).forEach(key => {
          if (!initialState.hasOwnProperty(key))
            throw new Error(`"${key}" is not found on state object`);
        });
        if (
          refMounted.current &&
          (!scope.length ||
            typeof nextState !== 'object' ||
            Object.keys(nextState).find(k => scope.indexOf(k) > -1))
        ) {
          return set({});
        }
      };
      subscribe(updater);
      return () => {
        refMounted.current = false;
        unsubscribe(updater);
      };
    }, []);

    useDebugValue(state);

    return [state, setState];
  };
}
