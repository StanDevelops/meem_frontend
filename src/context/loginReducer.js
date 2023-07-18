export const reducer = (loginState, action) => {
  switch (action.type) {
    case "login":
      localStorage.setItem("loginState", "true");
      return {
        ...loginState,
        loggedIn: true,
      };
    case "logout":
      localStorage.setItem("loginState", "false");
      // localStorage.setItem("accessToken", "");
      localStorage.removeItem("accessToken");
      return {
        ...loginState,
        loggedIn: false,
      };
    case "expired":
      localStorage.setItem("loginState", "false");
      // localStorage.setItem("accessToken", "");
      localStorage.removeItem("accessToken");
      return {
        ...loginState,
        loggedIn: false,
      };
    default:
      return loginState;
  }
};

export const initialState =
  localStorage.getItem("loginState") != null &&
  (localStorage.getItem("accessToken") != "" ||
    localStorage.getItem("accessToken") != undefined ||
    localStorage.getItem("accessToken") != null)
    ? { loggedIn: localStorage.getItem("loginState") === "true" }
    : { loggedIn: false };
