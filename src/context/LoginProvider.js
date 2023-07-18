import { createContext, useState, useReducer } from "react";
import ReactDOM from "react-dom";
import React from "react";
import { initialState, reducer } from "./loginReducer";

export const LoginContext = createContext({
  state: initialState,
  dispatch: () => null,
});
export const LoginProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <LoginContext.Provider value={[state, dispatch]}>
      {children}
    </LoginContext.Provider>
  );
};
