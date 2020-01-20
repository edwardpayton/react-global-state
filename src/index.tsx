import { useState, useRef, useCallback, useEffect, useDebugValue } from 'react';

export type Listener<T> = (state: T) => void;
export type ListenerSet<T> = Set<Listener<T>>;
// TODO work out whats happening with newState. Changing 'any' to 'T' breaks stuff
export type CallbackHook<T> = [T, (newState: any, typeSafe?: boolean) => void];
export type SubscribedState<T> = (scope?: string[]) => CallbackHook<T>;
export type GenericObject = { [key: string]: any };

function mergeObjects(
  original: GenericObject,
  updates: GenericObject,
  typeSafe = true
): GenericObject {
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

//

export default function createSubscribedState<T>(
  initialState: T
): SubscribedState<T> {
  let state: T = initialState;
  let listeners: ListenerSet<T> = new Set();
  const subscribe = (fn: Listener<T>) => listeners.add(fn);
  const unsubscribe = (fn: Listener<T>) => listeners.delete(fn);

  return function useHook(scope = []) {
    // note:  the name 'useHook' is not needed or used anywhere,
    // but the callback function needs a name because of rules of hooks
    // https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
    const [, set] = useState();
    const refMounted = useRef(true);

    const setState = useCallback((newState: T, typeSafe?: boolean) => {
      if (
        !scope.length ||
        !!Object.keys(newState).find(key => scope.indexOf(key) > -1)
      ) {
        console.log('hooks/createSubscribedState >>>', state);
        state = mergeObjects(state, newState, typeSafe) as T;
      }
      listeners.forEach(fn => fn(newState));
    }, []);

    useEffect(() => {
      const updaterEv = (nextState: Partial<T>) => {
        Object.keys(nextState).forEach(key => {
          const s: Partial<T> = initialState;
          if (!s.hasOwnProperty(key))
            throw new Error(`"${key}" is not found on state object`);
        });
        if (
          refMounted.current &&
          (!scope.length ||
            typeof nextState !== 'object' ||
            Object.keys(nextState).find(key => scope.indexOf(key) > -1))
        ) {
          return set({});
        }
      };
      subscribe(updaterEv);
      return () => {
        refMounted.current = false;
        unsubscribe(updaterEv);
      };
    }, []);

    useDebugValue(state);

    return [state, setState];
  };
}
