import axios from "axios";

const BASE_URL = "http://localhost:8080/api/categories";
const CategoryAPI = {
  getCategories: () => axios.get(`${BASE_URL}`),
  // getCategoryById: (categoryId) =>
  //   axios.get(`${BASE_URL}/id?categoryId=${categoryId}`),
  getCategoryByName: (categoryName) =>
    axios.get(`${BASE_URL}/name/${categoryName}`),
  createCategory: (accessToken, categoryName) => axios.post(`${BASE_URL}`, categoryName,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
  updateCategory: (accessToken, categoryId, categoryName) =>
    axios.put(`${BASE_URL}/${categoryId}`, categoryName,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
  deleteCategory: (accessToken, categoryId) => axios.delete(`${BASE_URL}/${categoryId}`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }),
};

export default CategoryAPI;
