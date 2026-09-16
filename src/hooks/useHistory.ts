"use client";

import { useCallback, useReducer } from "react";

const LIMIT = 80;

type HistoryState<T> = { past: T[]; present: T; future: T[] };
type HistoryAction<T> =
  | { type: "apply"; update: (present: T) => T }
  | { type: "transient"; update: (present: T) => T }
  | { type: "checkpoint" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "load"; value: T };

function reducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  switch (action.type) {
    case "apply": {
      const next = action.update(state.present);
      if (next === state.present) return state;
      return { past: [...state.past, state.present].slice(-LIMIT), present: next, future: [] };
    }
    case "transient":
      return { ...state, present: action.update(state.present) };
    case "checkpoint":
      return { past: [...state.past, state.present].slice(-LIMIT), present: state.present, future: [] };
    case "undo": {
      if (!state.past.length) return state;
      return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] };
    }
    case "redo": {
      if (!state.future.length) return state;
      return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
    }
    case "load":
      return { past: state.present === action.value ? state.past : [...state.past, state.present].slice(-LIMIT), present: action.value, future: [] };
  }
}

/**
 * Undoable state. `apply` records a step; for continuous gestures (dragging),
 * call `checkpoint` once at the start and then `transient` while it moves.
 */
export function useHistory<T>(initial: T) {
  const [state, dispatch] = useReducer(reducer<T>, { past: [], present: initial, future: [] });

  return {
    value: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    apply: useCallback((update: (present: T) => T) => dispatch({ type: "apply", update }), []),
    transient: useCallback((update: (present: T) => T) => dispatch({ type: "transient", update }), []),
    checkpoint: useCallback(() => dispatch({ type: "checkpoint" }), []),
    undo: useCallback(() => dispatch({ type: "undo" }), []),
    redo: useCallback(() => dispatch({ type: "redo" }), []),
    load: useCallback((value: T) => dispatch({ type: "load", value }), []),
  };
}
