import axios from "axios";

export const reducer = (activeCategoryState, action) => {
  // const getCategoryByName = (categoryName) => {
  //   if (categoryName != "") {
  //     const getCategory = axios.create({
  //       baseURL: "http://localhost:8080/api/categories",
  //     });
  //     getCategory
  //       .get(`/name?categoryName=${categoryName}`)
  //       .then((response) => {
  //         // console.log(response.data.category.categoryId);
  //         return response.data.category.categoryId;
  //       })
  //       .catch((err) => console.error(err));
  //   }
  // };
  switch (action.type) {
    case "Balkans":
      return {
        ...activeCategoryState,
        activeCategory: "Balkans",
        // categoryId: getCategoryByName(action.type),
      };
    case "Gaming":
      return {
        ...activeCategoryState,
        activeCategory: "Gaming",
        // categoryId: getCategoryByName(action.type),
      };
    case "Ragecomics":
      return {
        ...activeCategoryState,
        activeCategory: "Ragecomics",
        // categoryId: getCategoryByName(action.type),
      };
    case "Dank":
      return {
        ...activeCategoryState,
        activeCategory: "Dank",
        // categoryId: getCategoryByName(action.type),
      };
    case "Political":
      return {
        ...activeCategoryState,
        activeCategory: "Political",
      };
    case "Countries":
      return {
        ...activeCategoryState,
        activeCategory: "Countries",
      };
    case "Nature":
      return {
        ...activeCategoryState,
        activeCategory: "Nature",
      };
    case "Anti-joke":
      return {
        ...activeCategoryState,
        activeCategory: "Anti-joke",
      };
    case "Normal":
      return {
        ...activeCategoryState,
        activeCategory: "Normal",
      };
    case "NSFW":
      return {
        ...activeCategoryState,
        activeCategory: "NSFW",
      };
    case "Programming":
      return {
        ...activeCategoryState,
        activeCategory: "Programming",
      };
    case "Science":
      return {
        ...activeCategoryState,
        activeCategory: "Science",
      };
    case "deselect":
      return {
        ...activeCategoryState,
        activeCategory: "",
        // categoryId: getCategoryByName(action.type),
      };
    default:
      return activeCategoryState;
  }
};

export const defaultState = { activeCategory: "" };
