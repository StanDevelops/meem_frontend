import axios from "axios";
import {use} from "bcrypt/promises";

const BASE_URL = "http://localhost:8080/api/commentratings";
const CommentRatingAPI = {
    getCombinedCommentRatingsByUrl: (postUrl) => axios.get(`${BASE_URL}/combined/post?postUrl=${postUrl}`),
    getCommentRatingFromUserByUrl: (accessToken, postUrl, userId) => axios.get(`${BASE_URL}/user/post?postUrl=${postUrl}&userId=${userId}`,
        {
            withCredentials: true,
            headers: {
                // "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${accessToken}`,
            }
        }),
    createCommentRating: (accessToken, request) =>
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
    changeCommentRating: (accessToken, request) =>
        axios.put(
            `${BASE_URL}/updateRating`, request,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        ),
    removeCommentRating: (accessToken, commentId, userId) =>
        axios.delete(
            `${BASE_URL}/?commentId=${commentId}&userId=${userId}`,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        )
};

export default CommentRatingAPI;
