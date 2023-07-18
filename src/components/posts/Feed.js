import React, {useEffect, useState, useContext} from "react";
import {ActiveCategoryContext} from "../../context/ActiveCategoryProvider";
import {ActiveSortingGroupContext} from "../../context/ActiveSortinGroupProvider";
import "./Feed.css";
import {
    Stack,
    Snackbar,
    Alert,
    Skeleton,
    Card,
    Chip,
    CardHeader,
    CardMedia,
    CardActions,
    Typography,
    Container,
    CardContent,
    Avatar,
    Divider,
    IconButton,
    Badge,
    Collapse,
    // Popover,
    TextField,
    Tooltip,
    Zoom,
    ButtonBase,
    TouchR,
    Menu,
    MenuItem, Fade, Box, Button, Modal
} from "@mui/material";
import {OverlayTrigger, Popover} from "react-bootstrap/";
import {
    ThumbDownAltOutlined,
    CommentOutlined,
    ThumbUpOutlined,
    ThumbUp,
    ThumbDown,
    Share,
    MoreVert,
} from "@mui/icons-material";
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import axios from "axios";
import SortingGroupAPI from "../../apis/SortingGroupAPI";
import CategoryAPI from "../../apis/CategoryAPI";
import PostRatingAPI from "../../apis/PostRatingAPI";
import {fontSize, height} from "@mui/system";
import {LoginContext} from "../../context/LoginProvider";
import jwt_decode from "jwt-decode";
import PostAPI from "../../apis/PostAPI";
import UserAPI from "../../apis/UserAPI";
import {set} from "mdb-ui-kit/src/js/mdb/perfect-scrollbar/lib/css";

export const Feed = ({newlyUploadedPost, onAdded, followed}) => {
        const [activeCategoryState] = useContext(ActiveCategoryContext);
        // const [activeCategory, setActiveCategory] = useState({});
        const [activeGroupState] = useContext(ActiveSortingGroupContext);
        // const [activeGroup, setActiveGroup] = useState({});
        const [posts, setPosts] = useState([]);
        const [postToDelete, setPostToDelete] = useState(undefined);

        const [postRatings, setPostRatings] = useState([]);
        const [userPostRatings, setUserPostRatings] = useState([]);
        const [
            openBannedWarningSnackbar,
            setOpenBannedWarningSnackbar,
        ] = React.useState(false);
        const [openWarningSnackbar, setOpenWarningSnackbar] = React.useState(false);
        const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
        const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);
        const [openFailedDeletionSnackbar, setOpenFailedDeletionSnackbar] = React.useState(false);

        const [loginState, loginDispatch] = useContext(LoginContext);
        const [openCancelModal, setOpenCancelModal] = React.useState(false);

        const toggleCancelModal = () => {
            setOpenCancelModal(!openCancelModal);
        };

        const handleFollow = () => {
            if (validateAccessTokenAndReturnUser() !== null) {
                const request = {
                    "primaryUserId": validateAccessTokenAndReturnUser().userId,
                    "secondaryUserId": 32,
                    "relationType": "FOLLOWED"
                };
                UserAPI.createUserRelation(localStorage.getItem("accessToken"),
                    request);
            }

        };

        useEffect(() => {
            if (newlyUploadedPost !== undefined) {
                // Add the newly uploaded post to the array of posts
                if (activeGroupState.activeGroup === 'Fresh') {
                    setPosts((prevPosts) => [newlyUploadedPost, ...prevPosts]);
                    setPostRatings((prevPostRatings) =>
                        [...prevPostRatings,
                            {
                                "postId": newlyUploadedPost.postId,
                                "upvoteCount": 0,
                                "downvoteCount": 0
                            }]);
                    onAdded();
                }
                onAdded();
            }
        }, [newlyUploadedPost]);

        const handlePostDeletion = async () => {
            if (postToDelete !== undefined && validateAccessTokenAndReturnUser() !== null) {
                PostAPI.deletePost(localStorage.getItem("accessToken"), postToDelete).then((response) => {
                        if (
                            response.status === 204
                        ) {
                            setPosts(posts.filter(
                                    (post) => post.postId !== postToDelete
                                )
                            );
                            setPostRatings(postRatings.filter(
                                    (postRating) => postRating.postId !== postToDelete
                                )
                            );
                            if (userPostRatings !== undefined) {
                                setUserPostRatings(userPostRatings.filter(
                                        (userPostRating) => userPostRating.postId !== postToDelete
                                    )
                                );
                            }
                            toggleCancelModal();
                            setPostToDelete(undefined);
                        } else {
                            toggleCancelModal();
                            toggleFailedDeletionSnackbar();
                            setPostToDelete(undefined);
                        }
                    }
                )
                ;
            }
        }

        const handleDeletePostClick = (postId) => {
            toggleCancelModal();
            setPostToDelete(postId);
        }

        const convertToDate = (datePosted) => {
            const date = new Date(datePosted);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Month is 0-indexed
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const formattedDate = `${year}-${month
                .toString()
                .padStart(2, "0")}-${day
                .toString()
                .padStart(2, "0")} ${hours
                .toString()
                .padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            return formattedDate;

        };

        const handleShareClick = (postUrl) => {
            // setAnchorEl(event.currentTarget);
            navigator.clipboard.writeText(
                `${window.location.href}post/view/${postUrl}`
            );
            // document.getElementById(`tooltip${postUrl}`) =
            //   "Link copied to clipboard!";
        };

        // const handleShareClose = () => {
        //   setAnchorEl(null);
        // };

        const fetchPostRatingsForSortingGroup = async (groupId) => {
            /*here an API call is made to the post-ratings controller and a list of combined post ratings is returned;
            the rating object contains postId, upvoteCount and downvoteCount */
            const response = await PostRatingAPI.getCombinedPostRatingsBySortingGroup(groupId);
            if (response.status === 200) {
                return response.data;
            } else {
                return null;
            }
        };

        const fetchPostRatingsForSortingGroupAndCategory = async (groupId, categoryId) => {
            /*here an API call is made to the post-ratings controller and a list of combined post ratings is returned;
            the rating object contains postId, upvoteCount and downvoteCount */
            const response = await PostRatingAPI.getCombinedPostRatingsBySortingGroupAndCategory(groupId, categoryId);
            if (response.status === 200) {
                return response.data;
            } else {
                return null;
            }
        };

        const fetchPostRatingsFromUserBySortingGroupAndCategory = async (groupId, categoryId) => {
            /*here an API call is made to the post-ratings controller and a list of combined post ratings is returned;
            the rating object contains postId, upvoteCount and downvoteCount */

            if (validateAccessTokenAndReturnUser() !== null) {
                const response = await PostRatingAPI.getPostRatingsFromUserBySortingGroupAndCategory(
                    localStorage.getItem("accessToken"), validateAccessTokenAndReturnUser().userId, groupId, categoryId);
                if (response.status === 200) {
                    return response.data.postRatings;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        };

        const fetchPostRatingsFromUserBySortingGroup = async (groupId) => {
            /*here an API call is made to the post-ratings controller and a list of combined post ratings is returned;
            the rating object contains postId, upvoteCount and downvoteCount */

            if (validateAccessTokenAndReturnUser() !== null) {
                const response = await PostRatingAPI.getPostRatingsFromUserBySortingGroup(
                    localStorage.getItem("accessToken"), validateAccessTokenAndReturnUser().userId, groupId
                );
                if (response.status === 200) {
                    return response.data.postRatings;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        };


        const handleChangePostRating = async (ratingId, postId, ratingWeight) => {

            if (
                validateAccessTokenAndReturnUser() !== null
            ) {
                const user = validateAccessTokenAndReturnUser();
                if (user.userRole !== "BANNED") {
                    let request = {
                        "userId": user.userId,
                        "postId": postId,
                        "ratingId": ratingId,
                        "newRatingWeight": ratingWeight
                    }
                    PostRatingAPI.changePostRating(localStorage.getItem("accessToken"), request)
                        .then((response) => {
                            if (
                                response.status === 200
                            ) {
                                setPostRatings(
                                    postRatings.map((postRating) => {
                                        if (postRating.postId === postId) {
                                            return {
                                                ...postRating,
                                                upvoteCount: response.data.upvoteCount,
                                                downvoteCount: response.data.downvoteCount,
                                            };
                                        } else {
                                            return postRating;
                                        }
                                    })
                                );
                                setUserPostRatings(
                                    userPostRatings.map((userPostRating) => {
                                        if (
                                            userPostRating.ratingId === ratingId
                                        ) {
                                            return {
                                                ...userPostRating,
                                                weight: ratingWeight,
                                            };
                                        } else {
                                            return userPostRating;
                                        }
                                    })
                                );
                            } else {
                                console.log("couldn't check if user has rated post");
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            // do nothing
                        });
                } else {
                    //do nothing, user's banned, can't rate
                }
            }

        };

        const handleRemoveVote = async (ratingId, postId) => {
            /*here an API call is made to the post-ratings controller and a combined post ratings object should be returned, if the post was deleted successfully */

            if (
                validateAccessTokenAndReturnUser() !== null
            ) {
                await PostRatingAPI.removePostRating(localStorage.getItem("accessToken"), ratingId, postId, validateAccessTokenAndReturnUser().userId)
                    .then((response) => {
                        if (
                            response.status === 200
                        ) {
                            setPostRatings(
                                postRatings.map((postRating) => {
                                    if (postRating.postId === postId) {
                                        return {
                                            ...postRating,
                                            upvoteCount: response.data.upvoteCount,
                                            downvoteCount: response.data.downvoteCount,
                                        };
                                    } else {
                                        return postRating;
                                    }
                                })
                            );
                            setUserPostRatings(
                                userPostRatings.filter(
                                    (userRating) => userRating.ratingId !== ratingId
                                ));
                        } else {
                            console.log("couldn't check if user has rated post");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        // do nothing
                    });
            }

        };

        const handleRatePost = async (postId, ratingWeight) => {
            /*here an API call is made to the post-ratings controller and a combined post ratings object should be returned, if the post was rated successfully */

            if (
                validateAccessTokenAndReturnUser() !== null
            ) {
                const user = validateAccessTokenAndReturnUser();
                if (user.userRole !== "BANNED") {
                    let request = {
                        "userId": validateAccessTokenAndReturnUser().userId,
                        "postId": postId,
                        "ratingWeight": ratingWeight
                    }
                    await PostRatingAPI.createPostRating(localStorage.getItem("accessToken"), request)
                        .then((response) => {
                            if (response.status === 201) {
                                setPostRatings(
                                    postRatings.map((postRating) => {
                                        if (postRating.postId === postId) {
                                            return {
                                                ...postRating,
                                                upvoteCount: response.data.postRatings.upvoteCount,
                                                downvoteCount: response.data.postRatings.downvoteCount,
                                            };
                                        } else {
                                            return postRating;
                                        }
                                    })
                                );
                                setUserPostRatings([
                                    ...userPostRatings,
                                    {
                                        ratingId: response.data.ratingId,
                                        userId: user.userId,
                                        postId: postId,
                                        weight: ratingWeight
                                    },
                                ]);
                            } else {
                                // console.log(response.data);
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            // do nothing
                        });
                } else {
                    //do nothing, user's banned, can't rate
                }
            }
        };

        const getCategoryByName = async (categoryName) => {
            if (categoryName !== "" && categoryName !== undefined) {
                const response = await CategoryAPI.getCategoryByName(categoryName);
                if (response.status === 200) {
                    console.log(response.data);
                    return response.data.category;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        };


        function importAllImages(temp) {
            let images = {};
            temp.keys().map((image) => {
                images[image.replace("./", "")] = temp(image);
            });
            return images;
        }

        const images = importAllImages(
            require.context("../../assets/img/icons/", true)
        );

        function formatString(stringToFormat) {
            return stringToFormat
                .toLowerCase()
                .trim()
                .replace("-", "")
                .replace(" ", "");
        }

        const fetchGroupedPosts = async (groupId) => {
            try {
                if (groupId !== undefined && groupId !== null) {
                    const response = await PostAPI.getPostsBySortingGroup(groupId);
                    if (response.status === 200) {
                        return response.data.posts;
                    } else {
                        setOpenErrorSnackbar(true);
                        setPosts([]);
                        return null;
                    }
                } else {
                    return null;
                }
            } catch (error) {
                setOpenErrorSnackbar(!openErrorSnackbar);
                return null;
            }
        };
        const getSortingGroupByName = async (groupName) => {
            if (groupName !== "" && groupName !== undefined) {
                const response = await SortingGroupAPI.getSortingGroupByName(groupName);
                if (response.status === 200) {
                    return response.data.group;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        };
        const fetchGroupedPostsByCategory = async (groupId, categoryId) => {
            try {
                if (categoryId !== 0 && categoryId !== null && categoryId !== undefined) {
                    // if category has been selected //
                    if (groupId !== 0 && groupId !== null && groupId !== undefined) {
                        //if sorting group has been retrieved successfully //

                        const response = await PostAPI.getPostsBySortingGroupAndCategory(groupId, categoryId);
                        if (response.status === 200) {
                            return response.data.posts;
                        } else {
                            setOpenErrorSnackbar(true);
                            setPosts([]);
                            return null;
                        }
                    }
                } else {
                    return null;
                }
            } catch (error) {
                setOpenErrorSnackbar(!openErrorSnackbar);
                return null;
            }
        };

        useEffect(() => {
            const fetchData = async () => {
                if (
                    activeGroupState.activeGroup !== "" &&
                    activeGroupState.activeGroup !== undefined
                ) {
                    const group = await getSortingGroupByName(activeGroupState.activeGroup);
                    if (group !== null) {
                        // setActiveGroup(group);
                        if (
                            activeCategoryState.activeCategory !== "" &&
                            activeCategoryState.activeCategory !== undefined
                        ) {
                            const category = await getCategoryByName(activeCategoryState.activeCategory);
                            if (category !== null) {
                                if (validateAccessTokenAndReturnUser() !== null) {
                                    let response = await fetchGroupedPostsByCategory(group.groupId, category.categoryId);
                                    if (response !== null) {
                                        setPosts(response);
                                    }
                                    response = await fetchPostRatingsFromUserBySortingGroupAndCategory(group.groupId, category.categoryId);
                                    if (response !== null) {
                                        setUserPostRatings(response);
                                    }
                                    response = await fetchPostRatingsForSortingGroupAndCategory(group.groupId, category.categoryId);
                                    if (response !== null) {
                                        setPostRatings(response);
                                    }
                                } else {
                                    let response = await fetchGroupedPostsByCategory(group.groupId, category.categoryId);
                                    if (response !== null) {
                                        setPosts(response);
                                    }
                                    response = await fetchPostRatingsForSortingGroupAndCategory(group.groupId, category.categoryId);
                                    if (response !== null) {
                                        setPostRatings(response);
                                    }
                                }
                            }
                        } else {
                            if (validateAccessTokenAndReturnUser() !== null) {
                                let response = await fetchGroupedPosts(group.groupId);
                                if (response !== null) {
                                    setPosts(response);
                                }
                                response = await fetchPostRatingsFromUserBySortingGroup(group.groupId);
                                if (response !== null) {
                                    setUserPostRatings(response);
                                }
                                response = await fetchPostRatingsForSortingGroup(group.groupId);
                                if (response !== null) {
                                    setPostRatings(response);
                                }
                            } else {
                                let response = await fetchGroupedPosts(group.groupId);
                                if (response !== null) {
                                    setPosts(response);
                                }
                                response = await fetchPostRatingsForSortingGroup(group.groupId);
                                if (response !== null) {
                                    setPostRatings(response);
                                }
                            }
                        }
                    } else {
                        setPostRatings([]);
                        setPosts([]);
                        setUserPostRatings([]);
                    }
                }
            };
            fetchData();
        }, [activeGroupState, activeCategoryState]);

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

        const toggleWarningSnackbar = () => {
            setOpenWarningSnackbar(!openWarningSnackbar);
        };

        const toggleBannedWarningSnackbar = () => {
            setOpenBannedWarningSnackbar(!openBannedWarningSnackbar);
        };

        const toggleSuccessSnackbar = () => {
            setOpenSuccessSnackbar(!openSuccessSnackbar);
        };

        const toggleErrorSnackbar = () => {
            setOpenErrorSnackbar(!openErrorSnackbar);
        };
        const toggleFailedDeletionSnackbar = () => {
            setOpenFailedDeletionSnackbar(!openFailedDeletionSnackbar);
        }
        return (
            <Container
                // maxWidth="545px"
                fixed
                sx={{
                    // backgroundColor: "red",
                    position: "absolute",
                    zIndex: -1,
                    display: "grid",
                    left: "30.5% ",
                    top: "80px",
                    width: "725px",
                    height: "fit-content",
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    paddingTop: "0px",
                    paddingBottom: "0px",
                    // overflow: "scroll",
                    justifyItems: "center",
                    justifyContent: "center",
                }}
            >
                {/*<Chip clickable label="follow" onClick={handleFollow}></Chip>*/}
                <Card
                    sx={
                        posts.length === 0 || posts === null
                            ? {
                                position: "absolute",
                                left: "0%",
                                top: "25px",
                                width: "645px",
                                height: "480px",
                                marginLeft: "10px",
                                marginRight: "10px",
                                backgroundColor: "#ffffffb3",
                                // overflow: "scroll",
                            }
                            : {
                                display: "none",
                            }
                    }
                >
                    <CardHeader
                        title={
                            <Skeleton variant="rounded" width={610} height={30}></Skeleton>
                        }
                    ></CardHeader>
                    <Skeleton
                        variant="rounded"
                        width={610}
                        height={300}
                        sx={{marginLeft: "15px"}}
                    ></Skeleton>
                    <CardContent>
                        <Skeleton
                            variant="rounded"
                            width={310}
                            height={30}
                            sx={{marginLeft: "-1px"}}
                        ></Skeleton>
                    </CardContent>
                    <CardActions>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                // borderRadius: "2rem",
                                marginLeft: "10px",
                                marginRight: "5px",
                            }}
                        ></Skeleton>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                // borderRadius: "2rem",
                                marginLeft: "10px",
                                marginRight: "5px",
                            }}
                        ></Skeleton>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                // borderRadius: "2rem",
                                marginLeft: "10px",
                                marginRight: "5px",
                            }}
                        ></Skeleton>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                marginRight: "10px",
                            }}
                        ></Skeleton>
                    </CardActions>
                </Card>
                <Card
                    sx={
                        posts.length === 0 || posts === undefined
                            ? {
                                position: "absolute",
                                left: "0%",
                                top: "550px",
                                width: "645px",
                                height: "480px",
                                marginLeft: "10px",
                                marginRigh: "10px",
                                marginBottom: "50px",
                                backgroundColor: "#ffffffb3",
                            }
                            : {
                                display: "none",
                            }
                    }
                >
                    <CardHeader
                        title={
                            <Skeleton variant="rounded" width={610} height={30}></Skeleton>
                        }
                    ></CardHeader>
                    <Skeleton
                        variant="rounded"
                        width={610}
                        height={300}
                        sx={{marginLeft: "15px"}}
                    ></Skeleton>
                    <CardContent>
                        <Skeleton
                            variant="rounded"
                            width={310}
                            height={30}
                            sx={{marginLeft: "-1px"}}
                        ></Skeleton>
                    </CardContent>
                    <CardActions>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                marginLeft: "10px",
                                marginRight: "5px",
                            }}
                        ></Skeleton>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                marginLeft: "10px",
                                marginRight: "5px",
                            }}
                        ></Skeleton>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                marginLeft: "10px",
                                marginRight: "5px",
                            }}
                        ></Skeleton>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{
                                marginRight: "10px",
                            }}
                        ></Skeleton>
                    </CardActions>
                </Card>

                {posts.map((post) => {
                    return (
                        <Card
                            key={post.postId}
                            sx={{
                                maxWidth: 645,
                                left: "25%",
                                width: 645,
                                height: "fit-content",
                                minHeight: "250px",
                                marginTop: "25px",
                                marginBottom: "10px",
                                background: "linear-gradient(to bottom, #00c3ff43, #70cb1b30)",
                                backdropFilter: "blur(20px)",
                                boxShadow: "0px 0px 12px rgba(43, 46, 45, 0.7)",
                            }}
                        >
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="profile picture"
                                        src={post.pfpUrl}
                                        alt="profile picture"
                                    ></Avatar>
                                }
                                title={post.authorName}
                                subheader={`Posted ${convertToDate(post.datePosted)}`}
                                action={validateAccessTokenAndReturnUser() !== null ?
                                    validateAccessTokenAndReturnUser().userRole === 'ADMIN' ||
                                    validateAccessTokenAndReturnUser().userRole === 'MOD' ||
                                    validateAccessTokenAndReturnUser().userId === post.authorId ?
                                        <IconButton aria-label="delete" onClick={() => handleDeletePostClick(post.postId)}>
                                            <DeleteForeverRoundedIcon sx={{
                                                '&:hover': {
                                                    color: "#b20000",
                                                }
                                            }}/>
                                        </IconButton>
                                        :
                                        <>
                                        </>
                                    :
                                    <>
                                    </>
                                }
                                sx={{paddingBottom: "5px", marginBottom: "10px"}}
                            ></CardHeader>

                            <Typography id="postTitle" sx={{}}>
                                {post.postTitle}
                            </Typography>
                            <CardMedia
                                sx={{
                                    maxWidth: "605px",
                                    minWidth: "80px",
                                    width: "fit-content",
                                    height: "fit-content",
                                    maxHeight: "1200px",
                                    minHeight: "180px",
                                    objectFit: "contain",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    boxShadow: "0px 0px 8px rgba(43, 46, 45, 0.7)",
                                    backgroundColor: "black",
                                }}
                                image={post.postMedia}
                                component="img"
                                alt="post image"
                            ></CardMedia>
                            <Chip
                                avatar={
                                    <Avatar
                                        alt="icon"
                                        src={images[`${formatString(post.categoryName)}.png`]}
                                    />
                                }
                                label={post.categoryName}
                                sx={{
                                    marginLeft: "17px",
                                    marginTop: "15px",
                                    color: "white",
                                    textShadow: "0px 0px 3px #000000b7",
                                }}
                            />
                            <CardContent>

                            </CardContent>

                            <CardActions>
                                {
                                    //rating buttons
                                    validateAccessTokenAndReturnUser() !== null ?
                                        (//user logged in
                                            //active buttons

                                            postRatings !== undefined ?
                                                (//post ratings have been initialised

                                                    postRatings.map(
                                                        (postRating) => {
                                                            if (userPostRatings !== undefined) {
                                                                //user HAS rated SOME posts

                                                                if (post.postId === postRating.postId) {
                                                                    //found the ratings belonging to this post

                                                                    const userRating = userPostRatings.find(
                                                                        (userPostRating) => {
                                                                            return postRating.postId === userPostRating.postId;
                                                                        }
                                                                    );

                                                                    if (userRating !== undefined) {//user HAS rated THIS post
                                                                        if (userRating.weight > 0) {//user HAS UPVOTED this post

                                                                            return (
                                                                                <>
                                                                                    <Chip
                                                                                        label={postRating.upvoteCount}
                                                                                        variant="filled"
                                                                                        // id="cardActionChip"
                                                                                        sx={{
                                                                                            height: "60px",
                                                                                            borderRadius: "3rem",
                                                                                            color: "white",
                                                                                            width: "133px",
                                                                                            textShadow: "1px 1px 3px #000000b7",
                                                                                            justifyContent: "flex-start",
                                                                                        }}
                                                                                        avatar={
                                                                                            <Avatar
                                                                                                sx={{
                                                                                                    margin: "10px",
                                                                                                    marginLeft: "15px",
                                                                                                    boxShadow:
                                                                                                        "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                                }}
                                                                                                id={"upvoted"}
                                                                                                component={ButtonBase}
                                                                                                onClick={() =>
                                                                                                    handleRemoveVote(userRating.ratingId, post.postId)
                                                                                                }
                                                                                            >
                                                                                                <ThumbUp/>
                                                                                            </Avatar>
                                                                                        }
                                                                                    />
                                                                                    <Chip
                                                                                        label={postRating.downvoteCount}
                                                                                        variant="filled"
                                                                                        // id="cardActionChip"
                                                                                        sx={{
                                                                                            height: "60px",
                                                                                            borderRadius: "3rem",
                                                                                            color: "white",
                                                                                            width: "133px",
                                                                                            textShadow: "1px 1px 3px #000000b7",
                                                                                            justifyContent: "flex-start",
                                                                                        }}
                                                                                        avatar={
                                                                                            <Avatar
                                                                                                sx={{
                                                                                                    margin: "10px",
                                                                                                    marginLeft: "15px",
                                                                                                    boxShadow:
                                                                                                        "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                                }}
                                                                                                id={"downvote"}
                                                                                                component={ButtonBase}
                                                                                                onClick={() =>
                                                                                                    handleChangePostRating(userRating.ratingId, post.postId, -1)
                                                                                                }
                                                                                            >
                                                                                                <ThumbDownAltOutlined/>
                                                                                            </Avatar>
                                                                                        }
                                                                                    />
                                                                                </>
                                                                            );
                                                                        } else {//user HAS DOWNVOTED

                                                                            return (
                                                                                <>
                                                                                    <Chip
                                                                                        label={postRating.upvoteCount}
                                                                                        variant="filled"
                                                                                        sx={{
                                                                                            height: "60px",
                                                                                            borderRadius: "3rem",
                                                                                            color: "white",
                                                                                            width: "133px",
                                                                                            textShadow: "1px 1px 3px #000000b7",
                                                                                            justifyContent: "flex-start",
                                                                                        }}
                                                                                        avatar={
                                                                                            <Avatar
                                                                                                sx={{
                                                                                                    margin: "10px",
                                                                                                    marginLeft: "15px",
                                                                                                    boxShadow:
                                                                                                        "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                                }}
                                                                                                id={"upvote"}
                                                                                                component={ButtonBase}
                                                                                                onClick={() =>
                                                                                                    handleChangePostRating(userRating.ratingId, post.postId, 1)
                                                                                                }
                                                                                            >
                                                                                                <ThumbUpOutlined/>
                                                                                            </Avatar>
                                                                                        }
                                                                                    />
                                                                                    <Chip
                                                                                        label={postRating.downvoteCount}
                                                                                        variant="filled"
                                                                                        // id="cardActionChip"
                                                                                        sx={{
                                                                                            height: "60px",
                                                                                            borderRadius: "3rem",
                                                                                            color: "white",
                                                                                            width: "133px",
                                                                                            textShadow: "1px 1px 3px #000000b7",
                                                                                            justifyContent: "flex-start",
                                                                                        }}
                                                                                        avatar={
                                                                                            <Avatar
                                                                                                sx={{
                                                                                                    margin: "10px",
                                                                                                    marginLeft: "15px",
                                                                                                    boxShadow:
                                                                                                        "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                                }}
                                                                                                component={ButtonBase}
                                                                                                id={"downvoted"}
                                                                                                onClick={() =>
                                                                                                    handleRemoveVote(userRating.ratingId, post.postId)
                                                                                                }
                                                                                            >
                                                                                                <ThumbDown/>
                                                                                            </Avatar>
                                                                                        }
                                                                                    />
                                                                                </>
                                                                            );
                                                                        }
                                                                    } else {//user HASN'T rated THIS post

                                                                        return (
                                                                            <>
                                                                                <Chip
                                                                                    label={postRating.upvoteCount}
                                                                                    variant="filled"
                                                                                    // id="cardActionChip"
                                                                                    sx={{
                                                                                        height: "60px",
                                                                                        borderRadius: "3rem",
                                                                                        color: "white",
                                                                                        width: "133px",
                                                                                        textShadow: "1px 1px 3px #000000b7",
                                                                                        justifyContent: "flex-start",
                                                                                    }}
                                                                                    avatar={
                                                                                        <Avatar
                                                                                            sx={{
                                                                                                margin: "10px",
                                                                                                marginLeft: "15px",
                                                                                                boxShadow:
                                                                                                    "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                            }}
                                                                                            component={ButtonBase}
                                                                                            id={"upvote"}
                                                                                            onClick={() => handleRatePost(post.postId, 1)}
                                                                                        >
                                                                                            <ThumbUpOutlined/>
                                                                                        </Avatar>
                                                                                    }
                                                                                />
                                                                                <Chip
                                                                                    label={postRating.downvoteCount}
                                                                                    variant="filled"
                                                                                    sx={{
                                                                                        height: "60px",
                                                                                        borderRadius: "3rem",
                                                                                        color: "white",
                                                                                        width: "133px",
                                                                                        textShadow: "1px 1px 3px #000000b7",
                                                                                        justifyContent: "flex-start",
                                                                                    }}
                                                                                    avatar={
                                                                                        <Avatar
                                                                                            sx={{
                                                                                                margin: "10px",
                                                                                                marginLeft: "15px",
                                                                                                boxShadow:
                                                                                                    "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                            }}
                                                                                            component={ButtonBase}
                                                                                            id={"downvote"}
                                                                                            onClick={() =>
                                                                                                handleRatePost(post.postId, -1)
                                                                                            }
                                                                                        >
                                                                                            <ThumbDownAltOutlined/>
                                                                                        </Avatar>
                                                                                    }
                                                                                />
                                                                            </>
                                                                        );
                                                                    }
                                                                }
                                                            } else {
                                                                //user HASN'T rated ANY posts
                                                                return (
                                                                    <>
                                                                        <Chip
                                                                            label={postRating.upvoteCount}
                                                                            variant="filled"
                                                                            // id="cardActionChip"
                                                                            sx={{
                                                                                height: "60px",
                                                                                borderRadius: "3rem",
                                                                                color: "white",
                                                                                width: "133px",
                                                                                textShadow: "1px 1px 3px #000000b7",
                                                                                justifyContent: "flex-start",
                                                                            }}
                                                                            avatar={
                                                                                <Avatar
                                                                                    sx={{
                                                                                        margin: "10px",
                                                                                        marginLeft: "15px",
                                                                                        boxShadow:
                                                                                            "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                    }}
                                                                                    component={ButtonBase}
                                                                                    id={"upvote"}
                                                                                    onClick={() => handleRatePost(post.postId, 1)}
                                                                                >
                                                                                    <ThumbUpOutlined/>
                                                                                </Avatar>
                                                                            }
                                                                        />
                                                                        <Chip
                                                                            label={postRating.downvoteCount}
                                                                            variant="filled"
                                                                            sx={{
                                                                                height: "60px",
                                                                                borderRadius: "3rem",
                                                                                color: "white",
                                                                                width: "133px",
                                                                                textShadow: "1px 1px 3px #000000b7",
                                                                                justifyContent: "flex-start",
                                                                            }}
                                                                            avatar={
                                                                                <Avatar
                                                                                    sx={{
                                                                                        margin: "10px",
                                                                                        marginLeft: "15px",
                                                                                        boxShadow:
                                                                                            "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                    }}
                                                                                    component={ButtonBase}
                                                                                    id={"downvote"}
                                                                                    onClick={() =>
                                                                                        handleRatePost(post.postId, -1)
                                                                                    }
                                                                                >
                                                                                    <ThumbDownAltOutlined/>
                                                                                </Avatar>
                                                                            }
                                                                        />
                                                                    </>
                                                                );
                                                            }
                                                        }
                                                    )
                                                )
                                                :

                                                //no post ratings, do nothing

                                                {}


                                        )
                                        :
                                        (
                                            //user not logged in
                                            //normal buttons

                                            postRatings !== undefined ?
                                                (
                                                    //post ratings have been initialised

                                                    postRatings.map(
                                                        (postRating) => {
                                                            if (post.postId === postRating.postId) {
                                                                //found the ratings belonging to this post

                                                                return (
                                                                    <>
                                                                        <Chip
                                                                            label={postRating.upvoteCount}
                                                                            variant="filled"
                                                                            // id="cardActionChip"
                                                                            sx={{
                                                                                height: "60px",
                                                                                borderRadius: "3rem",
                                                                                color: "white",
                                                                                width: "133px",
                                                                                textShadow: "1px 1px 3px #000000b7",
                                                                                justifyContent: "flex-start",
                                                                            }}
                                                                            avatar={
                                                                                <Avatar
                                                                                    sx={{
                                                                                        margin: "10px",
                                                                                        marginLeft: "15px",
                                                                                        boxShadow:
                                                                                            "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                    }}
                                                                                    id={"upvote"}
                                                                                    component={ButtonBase}
                                                                                    onClick={() => toggleWarningSnackbar()}
                                                                                >
                                                                                    <ThumbUpOutlined/>
                                                                                </Avatar>
                                                                            }
                                                                        />
                                                                        <Chip
                                                                            label={postRating.downvoteCount}
                                                                            variant="filled"
                                                                            sx={{
                                                                                height: "60px",
                                                                                borderRadius: "3rem",
                                                                                color: "white",
                                                                                width: "133px",
                                                                                textShadow: "1px 1px 3px #000000b7",
                                                                                justifyContent: "flex-start",
                                                                            }}
                                                                            avatar={
                                                                                <Avatar
                                                                                    sx={{
                                                                                        margin: "10px",
                                                                                        marginLeft: "15px",
                                                                                        boxShadow:
                                                                                            "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                                                    }}
                                                                                    component={ButtonBase}
                                                                                    id={"downvote"}
                                                                                    onClick={() => toggleWarningSnackbar()}
                                                                                >
                                                                                    <ThumbDownAltOutlined/>
                                                                                </Avatar>
                                                                            }
                                                                        />
                                                                    </>
                                                                );
                                                            }
                                                        }
                                                    )
                                                )
                                                :
                                                {
                                                    //no post ratings, no posts, therefore do nothing
                                                }
                                        )
                                }
                                <Chip
                                    label={0}
                                    variant="filled"
                                    sx={{
                                        height: "60px",
                                        borderRadius: "3rem",
                                        color: "white",
                                        width: "133px",
                                        justifyContent: "flex-start",
                                    }}
                                    avatar={
                                        <Avatar
                                            sx={{
                                                margin: "10px",
                                                marginLeft: "15px",
                                                boxShadow: "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                                right: "",
                                            }}
                                            id="comments"
                                            component={ButtonBase}
                                        >
                                            <CommentOutlined/>
                                        </Avatar>
                                    }
                                />
                                <Tooltip
                                    id={`tooltip${post.postUrl}`}
                                    TransitionComponent={Zoom}
                                    title="Copy post link."
                                    placement="right"
                                >
                                    <Avatar
                                        sx={{
                                            margin: "10px",
                                            marginLeft: "15px",
                                            boxShadow: "0px 0px 4px rgba(43, 46, 45, 0.961)",
                                            right: "",
                                        }}
                                        id="share"
                                        component={ButtonBase}
                                        onClick={() => handleShareClick(post.postUrl)}
                                    >
                                        {/* <ButtonBase> */}
                                        <Share/>
                                        {/* </ButtonBase> */}
                                    </Avatar>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    );
                })
                }
                <Snackbar
                    open={openWarningSnackbar}
                    autoHideDuration={1000}
                    onClose={toggleWarningSnackbar}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert
                        elevation={6}
                        variant="filled"
                        onClose={toggleWarningSnackbar}
                        severity={"warning"}
                        sx={{width: "100%"}}
                    >
                        You must be logged-in first!
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={openBannedWarningSnackbar}
                    autoHideDuration={1000}
                    onClose={toggleWarningSnackbar}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert
                        elevation={6}
                        variant="filled"
                        onClose={toggleBannedWarningSnackbar}
                        severity={"warning"}
                        sx={{width: "100%"}}
                    >
                        [BANNED] Can't perform this action!
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={openSuccessSnackbar}
                    autoHideDuration={1000}
                    onClose={toggleSuccessSnackbar}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert
                        elevation={6}
                        variant="filled"
                        onClose={toggleSuccessSnackbar}
                        severity={"success"}
                        sx={{width: "100%"}}
                    >
                        Post uploaded!
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={openErrorSnackbar}
                    autoHideDuration={1500}
                    onClose={toggleErrorSnackbar}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert
                        elevation={6}
                        variant="filled"
                        onClose={toggleErrorSnackbar}
                        severity={"error"}
                        // autoHideDuration={20}
                        sx={{width: "100%"}}
                    >
                        Failed to load posts...
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={openFailedDeletionSnackbar}
                    autoHideDuration={1000}
                    onClose={toggleErrorSnackbar}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert
                        elevation={6}
                        variant="filled"
                        onClose={toggleFailedDeletionSnackbar}
                        severity={"error"}
                        sx={{width: "100%"}}
                    >
                        Post deletion failed!
                    </Alert>
                </Snackbar>
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={openCancelModal}
                    onClose={toggleCancelModal}
                    closeAfterTransition
                >
                    <Fade in={openCancelModal}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 400,
                                bgcolor: "rgba(255, 255, 255, 0.5)",
                                border: "2px solid #ed6c02",
                                boxShadow: 24,
                                borderRadius: "2rem",
                                backdropFilter: "blur(9px)",
                                p: 4,
                            }}
                        >
                            <Typography id="transition-modal-title" variant="h5" component="h2">
                                Are you sure?
                            </Typography>
                            <Typography
                                id="transition-modal-description"
                                variant="h6"
                                sx={{mt: 2}}
                            >
                                This post will be deleted!
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                sx={{
                                    marginLeft: "10px",
                                    marginRight: "10px",
                                    marginTop: "22px",
                                    borderRadius: "2rem",
                                }}
                                onClick={() => toggleCancelModal()}
                            >
                                No
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                sx={{
                                    marginLeft: "10px",
                                    marginRight: "10px",
                                    marginTop: "22px",
                                    borderRadius: "2rem",
                                    left: "50%",
                                }}
                                onClick={() => handlePostDeletion()}
                            >
                                Yes
                            </Button>
                        </Box>
                    </Fade>
                </Modal>
            </Container>
        );
    }
;

export default Feed;
