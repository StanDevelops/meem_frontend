import axios from "axios";

const BASE_URL = "http://localhost:8080/api/posts";
const PostAPI = {
    getPost: (postUrl) => axios.get(`${BASE_URL}/view/${postUrl}`),
    getPosts: () => axios.get(`${BASE_URL}/all`),
    getPostsBySortingGroup: (groupId) => axios.get(`${BASE_URL}/sorting/?groupId=${groupId}`),
    getPostsBySortingGroupAndCategory: (groupId, categoryId) => axios.get(`${BASE_URL}/sorting/category/?groupId=${groupId}&categoryId=${categoryId}`),
    deletePost: (accessToken, postId) => axios.delete(`${BASE_URL}/${postId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        }),
    createPost: (accessToken, request) =>
        axios.post(
            `${BASE_URL}/external`, request,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        ),
    // createUser: (registerRequest) => axios.post(`${BASE_URL}`, registerRequest),
    // updateCategory: (categoryId, categoryName) => axios.put(`${BASE_URL}/api/categories`, categoryId, categoryName),
    // deleteCategory: categoryId => axios.delete(`${BASE_URL}/api/categories`, categoryId)
};

export default PostAPI;
