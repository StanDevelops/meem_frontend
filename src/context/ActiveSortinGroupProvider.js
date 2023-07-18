import { createContext, useState, useReducer } from "react";
import ReactDOM from "react-dom";
import React from "react";
import { defaultState, reducer } from "./activeSortingGroupReducer";

export const ActiveSortingGroupContext = createContext({
  state: defaultState,
  dispatch: () => null,
});
export const ActiveSortingGroupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  return (
    <ActiveSortingGroupContext.Provider value={[state, dispatch]}>
      {children}
    </ActiveSortingGroupContext.Provider>
  );
};
