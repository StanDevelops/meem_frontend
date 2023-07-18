import SideNav from "../components/layouts/SideNavigation/SideNav";
import {MainNav} from "../components/layouts/MainNavigation/MainNav";
import React, {useContext, useEffect, useState} from "react";
import CreatePost from "../components/posts/CreatePost";
import Feed from "../components/posts/Feed";
import "./HomePage.css";
import jwt_decode from "jwt-decode";
import {LoginContext} from "../context/LoginProvider";
import UserAPI from "../apis/UserAPI";
import { Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Avatar, Chip, Snackbar, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

export const HomePage = () => {
        const [newlyUploadedPost, setNewlyUploadedPost] = useState(undefined);
        const [followedUsers, setFollowedUsers] = useState([]);
        const [loginState, loginDispatch] = useContext(LoginContext);
        const [stompClient, setStompClient] = useState(undefined);
        const [notification, setNotification] = useState(null);
    const handleSnackbarClose = () => {
        setNotification(null);
    };
        const establishWebSocketConnection = () => {
                if (validateAccessTokenAndReturnUser() !== null) {
                    const userId = validateAccessTokenAndReturnUser().username;
                    // const socket = new WebSocket('ws://localhost:8080/ws');
                    let client = null;
                    let socket = new SockJS('http://localhost:8080/ws');
                    client = Stomp.over(socket);

                    setStompClient(client);
                    client.connect({}, function () {
                        client.subscribe(`/user/${userId}/notifications`, (message) => {
                            const notification = JSON.parse(message.body);
                            console.log('Received notification:', notification);
                            setNotification(notification);
                        });
                    });

                }
            }
        ;


        const sendPostUploadMessage = (newMessage) => {
            // if (stompClient && stompClient.connected) {
            let destination = '/app/notify';
            {
                stompClient.publish({destination, body: JSON.stringify(newMessage)});
            }
        }

        useEffect(() => {
            if (validateAccessTokenAndReturnUser() !== null) {
                getFollowedUsers();
                // connect();
                establishWebSocketConnection();
            }
        }, [loginState])

        const handleNewPost = (post) => {
            setNewlyUploadedPost(post);
            sendPostUploadMessage({
                "postTitle": post.postTitle,
                "authorId": post.authorId,
                "postUrl": post.postUrl,
                "authorUsername": post.authorName,
                "authorPfpUrl": post.pfpUrl
            })
        };
        const handleAdded = () => {
            setNewlyUploadedPost(undefined);
        }
        const getFollowedUsers = () => {
            if (validateAccessTokenAndReturnUser() !== null) {
                UserAPI.getUserRelations(localStorage.getItem("accessToken"), validateAccessTokenAndReturnUser().username, 'FOLLOWED').then(
                    (response) => {
                        if (response.status === 200) {
                            setFollowedUsers(response.data);
                        }
                    }
                )
            }
        }

        const validateAccessTokenAndReturnUser = () => {
            if (
                localStorage.getItem("loginState") === "true" &&
                loginState.loggedIn === true &&
                localStorage.getItem("accessToken") !== "" &&
                localStorage.getItem("accessToken") !== undefined &&
                localStorage.getItem("accessToken") !== null
            ) {
                const accessToken = localStorage.getItem("accessToken");
                const decodedToken = jwt_decode(accessToken);
                const userId = decodedToken["userId"];
                const userRole = decodedToken["authority"];
                const username = decodedToken["sub"];
                const expirationDate = decodedToken["exp"];
                const user = {userId, userRole, username};
                const timestamp = Date.now() / 1000;

                if (expirationDate > timestamp) {
                    return user;
                } else {
                    loginDispatch({type: "expired"});
                    return null;
                }
            } else {
                return null;
            }
        };

        return (
            <section>
                <div className="bg"></div>
                <div className="bg bg2"></div>
                <div className="bg bg3"></div>
                <MainNav/>
                <SideNav/>
                <CreatePost onNewPost={handleNewPost}/>
                <Feed newlyUploadedPost={newlyUploadedPost} followed={followedUsers} onAdded={handleAdded}/>
                {notification && (<Snackbar
                    open={notification!==null ? true : false}
                    autoHideDuration={2700}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <MuiAlert
                        severity="info"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {/*<Avatar alt="Author Avatar" src={notification.authorPfpUrl} />*/}
                        <div>
                            <Typography variant="subtitle1" component="div">
                                {notification.postTitle.slice(0, 14)}
                            </Typography>
                            <Typography variant="subtitle2" component="div">
                                {notification.authorUsername} just uploaded a post
                            </Typography>
                        </div>
                        <Chip
                            label="Go see it"
                            component="a"
                            href={`http://localhost:3000/post/view/${notification.postUrl}`}
                            target="_blank"
                            clickable
                            variant="outlined"
                            sx={{
                                marginLeft: 'auto',
                                cursor: 'pointer',
                            }}
                        />
                    </MuiAlert>
                </Snackbar>)}
            </section>
        );
    }
;

export default HomePage;
