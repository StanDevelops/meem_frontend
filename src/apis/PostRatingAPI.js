import axios from "axios";

const BASE_URL = "http://localhost:8080/api/postratings";
const PostRatingAPI = {
    getCombinedPostRatingsByUrl: (postUrl) => axios.get(`${BASE_URL}/combined/post/${postUrl}`),
    getCombinedPostRatingsBySortingGroup: (groupId) => axios.get(`${BASE_URL}/combined/group?groupId=${groupId}`),
    getCombinedPostRatingsBySortingGroupAndCategory: (groupId, categoryId) => axios.get(`${BASE_URL}/combined/group?groupId=${groupId}&categoryId=${categoryId}`),
    getPostRatingFromUserByUrl: (accessToken, userId, postUrl) =>
        axios.get(`${BASE_URL}/user/post/${postUrl}/?userId=${userId}`,
            {
                withCredentials: true,
                headers: {
                    // "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${accessToken}`,
                }
            }),
    getPostRatingsFromUserBySortingGroup: (accessToken, userId, groupId) =>
        axios.get(`${BASE_URL}/user/group?userId=${userId}&groupId=${groupId}`,
            {
                withCredentials: true,
                headers: {
                    // "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${accessToken}`,
                }
            }),
    getPostRatingsFromUserBySortingGroupAndCategory: (accessToken, userId, groupId, categoryId) =>
        axios.get(`${BASE_URL}/user/group-category?userId=${userId}&groupId=${groupId}&categoryId=${categoryId}`,
            {
                withCredentials: true,
                headers: {
                    // "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${accessToken}`,
                }
            }),
    getAveragePostRatingPerGroup: (accessToken) =>
        axios.get(`${BASE_URL}/stats/group-average`, {
            withCredentials: true,
            headers: {
                // "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${accessToken}`,
            }
        }),
    createPostRating: (accessToken, request) =>
        axios.post(
            `${BASE_URL}`, request,
            {
                withCredentials: true,
                headers: {
                    // "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        ),
    changePostRating: (accessToken, request) =>
        axios.put(
            `${BASE_URL}/updateRating`, request,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        ),
    removePostRating: (accessToken, ratingId, postId, userId) =>
        axios.delete(
            `${BASE_URL}/${ratingId}?postId=${postId}&userId=${userId}`,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        )
};

export default PostRatingAPI;
