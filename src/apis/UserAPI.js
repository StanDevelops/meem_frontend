import axios from "axios";

const BASE_URL = "http://localhost:8080/api/users";

const UserAPI = {

  getUserPFP: (userId) =>
    axios.get(`${BASE_URL}/pfp?userId=${userId}`),
  getUserRelations: (accessToken,username, relationType) =>
      axios.get(`${BASE_URL}/relations?username=${username}&relationType=${relationType}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          }),
    createUserRelation: (accessToken, CreateUserRelationRequest) =>
        axios.post(`${BASE_URL}/relations`, CreateUserRelationRequest,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }),
  createUser: (CreateUserRequest) =>
    axios.post(
      `${BASE_URL}`, CreateUserRequest
    ),
  // createUser: (registerRequest) => axios.post(`${BASE_URL}`, registerRequest),
  // deleteCategory: categoryId => axios.delete(`${BASE_URL}/api/categories`, categoryId)
};

export default UserAPI;
