import { createContext, useState, useReducer } from "react";
import ReactDOM from "react-dom";
import React from "react";
import { defaultState, reducer } from "./activeCategoryReducer";

export const ActiveCategoryContext = createContext({
  state: defaultState,
  dispatch: () => null,
});
export const ActiveCategoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  return (
    <ActiveCategoryContext.Provider value={[state, dispatch]}>
      {children}
    </ActiveCategoryContext.Provider>
  );
};
