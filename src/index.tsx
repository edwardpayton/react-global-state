import { useState, useRef, useCallback, useEffect, useDebugValue } from 'react';

export type Listener<T> = (state: T) => void;
export type ListenerSet<T> = Set<Listener<T>>;
// TODO work out whats happening with newState. Changing 'any' to 'T' breaks stuff
export type CallbackHook<T> = [T, (newState: any) => void];
export type SubscribedState<T> = (scope?: string[]) => CallbackHook<T>;
export type GenericObject = { [key: string]: any };

function mergeObjects(
  original: GenericObject,
  updates: GenericObject
): GenericObject {
  const isObject = (obj: unknown) => obj && typeof obj === 'object';
  if (!isObject(original) || !isObject(updates)) return updates;

  Object.keys(updates).forEach(key => {
    if (Array.isArray(original[key]) && Array.isArray(updates[key])) {
      return (original[key] = updates[key]);
    } else if (isObject(original[key]) && isObject(updates[key])) {
      return (original[key] = mergeObjects(
        Object.assign({}, original[key]),
        updates[key]
      ));
    }

    if (typeof original[key] !== typeof updates[key])
      throw new Error(
        `type of "${key}" was transformed from "${typeof original[
          key
        ]}" to "${typeof updates[
          key
        ]}". If this was intentional add true as a second argument to your setState function`
      );

    return (original[key] = updates[key]);
  });

  return original;
}

//

export default function createSubscribedState<T>(
  initialState: T
): SubscribedState<T> {
  if (
    !initialState ||
    Object.prototype.toString.call(initialState) !== '[object Object]'
  ) {
    console.error('A new shared state was created without an initial state');
    initialState = {} as T;
  }

  let state: T = { ...initialState };
  let listeners: ListenerSet<T> = new Set();
  const subscribe = (fn: Listener<T>) => listeners.add(fn);
  const unsubscribe = (fn: Listener<T>) => listeners.delete(fn);

  return function useHook(scope = []) {
    // note:  the name 'useHook' is not needed or used anywhere,
    // but the callback function needs a name because of rules of hooks
    // https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
    const [, set] = useState();
    const refMounted = useRef(true);

    const setState = useCallback((newState: Partial<T>) => {
      const disallowedKeys = scope.length
        ? Object.keys(initialState).filter(key => scope.indexOf(key) <= -1)
        : [];

      const newStateFiltered = Object.keys(newState)
        .map(key => {
          const s: Partial<T> = initialState;
          if (!s.hasOwnProperty(key))
            throw new Error(`key "${key}" is not found on state object`);
          return key;
        })
        .filter(key => disallowedKeys.indexOf(key) <= -1)
        .reduce((res, key) => {
          // TODO - TS errors without asserting to GenericObject. maybe find a better way
          res[key] = (newState as GenericObject)[key];
          return res;
        }, {} as GenericObject);

      state = mergeObjects(state, newStateFiltered) as T;
      listeners.forEach(fn => fn(newState as T));
    }, []);

    useEffect(() => {
      const updaterEv = () => {
        if (refMounted.current) return set({});
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
