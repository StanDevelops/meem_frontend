
//
// import React, {useContext, useEffect, useState} from 'react';
// import axios from 'axios';
// import { Bar } from 'react-chartjs-2';
// import jwt_decode from "jwt-decode";
// import {LoginContext} from "../context/LoginProvider";
// import PostRatingAPI from "../apis/PostRatingAPI";
//
const AdminPage = () => {
//     const [groupStatistics, setGroupStatistics] = useState([]);
//     const [loginState, loginDispatch] = useContext(LoginContext);
//
//     const validateAccessTokenAndReturnUser = () => {
//         if (
//             localStorage.getItem("loginState") === "true" &&
//             loginState.loggedIn === true &&
//             localStorage.getItem("accessToken") !== "" &&
//             localStorage.getItem("accessToken") !== undefined &&
//             localStorage.getItem("accessToken") !== null
//         ) {
//             const accessToken = localStorage.getItem("accessToken");
//             const decodedToken = jwt_decode(accessToken);
//             const userId = decodedToken["userId"];
//             const userRole = decodedToken["authority"];
//             const username = decodedToken["sub"];
//             const expirationDate = decodedToken["exp"];
//             const user = {userId, userRole, username};
//             const timestamp = Date.now() / 1000;
//
//             if (expirationDate > timestamp) {
//                 return user;
//             } else {
//                 loginDispatch({type: "expired"});
//                 return null;
//             }
//         } else {
//             return null;
//         }
//     };
//
//     useEffect(() => {
//         fetchData();
//     }, []);
//
//     const fetchData = async () => {
//         try {
//             if (validateAccessTokenAndReturnUser() !== null) {
//                 const response = await PostRatingAPI.getAveragePostRatingPerGroup(localStorage.getItem("accessToken"))
//                 setGroupStatistics(response.data.statistics);
//             }
//
//         } catch (error) {
//             console.error('Error fetching data:', error);
//         }
//     };
//
//     const getChartData = () => {
//         const labels = groupStatistics.map((group) => group.groupName);
//
//         const averageRatingData = groupStatistics.map((group) => group.averageRating);
//         const upvotesCountData = groupStatistics.map((group) => group.upvotesCount);
//         const downvotesCountData = groupStatistics.map((group) => group.downvotesCount);
//
//         return {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Average Rating',
//                     data: averageRatingData,
//                     backgroundColor: 'rgba(255, 99, 132, 0.5)',
//                 },
//                 {
//                     label: 'Upvotes Count',
//                     data: upvotesCountData,
//                     backgroundColor: 'rgba(53, 162, 235, 0.5)',
//                 },
//                 {
//                     label: 'Downvotes Count',
//                     data: downvotesCountData,
//                     backgroundColor: 'rgba(75, 192, 192, 0.5)',
//                 },
//             ],
//         };
//     };
//
//     return (
//         <div>
//             <Bar data={getChartData()} options={{ responsive: true }} />
//         </div>
//     );
// };
//
}
export default AdminPage;