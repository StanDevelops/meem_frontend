// import { MainNav } from "../components/layouts/MainNavigation/MainNav";
import ReactDOM from "react-dom";
import "../components/layouts/MainNavigation/MainNav.css";
import {  Nav } from "react-bootstrap";
import LoginModal from "../components/ModalBoxes/Login";
import RegisterModal from "../components/ModalBoxes/Register";
import React from "react";
import {LoginContext} from "../context/LoginProvider";
import jwt_decode from "jwt-decode";
import "./ViewPostPage.css";
import {useState, useEffect, useContext} from "react";
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
import {
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
    IconButton,
    Zoom,
    Tooltip,
    ButtonBase,
    Grid,
    Stack, Fade, Box, Button, Modal
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Navigate, useParams} from "react-router-dom";
import UserAPI from "../apis/UserAPI";
import PostRatingAPI from "../apis/PostRatingAPI";
import PostAPI from "../apis/PostAPI";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";

export const ViewPostPage = (props) => {
    const [post, setPost] = useState({});
    const {postUrl} = useParams();
    const [combinedPostRatings, setCombinedPostRatings] = useState(undefined);
    const [userPostRating, setUserPostRating] = useState(undefined);
    const [loginState, loginDispatch] = useContext(LoginContext);
    const [pfp, setPfp] = useState("/");
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [openDropdown, setOpenDropdown] = React.useState(false);
    const [openFailedDeletionSnackbar, setOpenFailedDeletionSnackbar] = React.useState(false);
    const [openCancelModal, setOpenCancelModal] = React.useState(false);
    const [postToDelete, setPostToDelete] = useState(undefined);

    const toggleCancelModal = () => {
        setOpenCancelModal(!openCancelModal);
    };

    const handleOpen = () => {
        setOpenDropdown(!openDropdown);
    };

    const handleCloseLogin = () => {
        setShowLogin(false);
    };
    const handleShowLogin = () => {
        setShowLogin(true);
    };

    const handleCloseRegister = () => {
        setShowRegister(false);
    };
    const handleShowRegister = () => {
        setShowRegister(true);
    };
    function importAllImages(temp) {
        let images = {};
        temp.keys().map((image) => {
            images[image.replace("./", "")] = temp(image);
        });
        return images;
    }

    const images = importAllImages(require.context("../assets/img/icons/", true));

    function formatString(stringToFormat) {
        if (stringToFormat !== "" && stringToFormat !== undefined) {
            return stringToFormat
                .toLowerCase()
                .trim()
                .replace("-", "")
                .replace(" ", "");
        }
    }

    const handlePostDeletion = () => {
        if (postToDelete !== undefined && validateAccessTokenAndReturnUser() !== null) {
            PostAPI.deletePost(localStorage.getItem("accessToken"), postToDelete).then((response) => {
                    if (
                        response.status === 204
                    ) {
                        toggleCancelModal();
                        setPostToDelete(undefined);
                        // Navigate("/");
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

    const getPfp = () => {
        if (
            validateAccessTokenAndReturnUser() !== null
        ) {
            UserAPI.getUserPFP(validateAccessTokenAndReturnUser().userId)
                .then((response) => {
                    setPfp(response.data.pfpUrl);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };
    useEffect(() => {
        if (loginState.loggedIn === true) {
            getPfp();
            getUserPostRatingByPostUrl();
        }
    }, [loginState]);
    const handleLogout = () => {
        handleOpen();
        loginDispatch({ type: "logout" });
    };
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
    const toggleFailedDeletionSnackbar = () => {
        setOpenFailedDeletionSnackbar(!openFailedDeletionSnackbar);
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
        navigator.clipboard.writeText(`localhost:3000/post/view/${postUrl}`);
    };

    const loadPostByUrl = () => {
        try {
            if (postUrl !== "" && postUrl !== null && postUrl !== undefined) {
                //if address url has been retrieved successfully //
                PostAPI.getPost(postUrl).then((response) => {
                    if (
                        response.status === 200
                    ) {
                        setPost(response.data.post);
                    } else {
                        console.log("something wrong");

                    }
                });
            }
        } catch (error) {
        }
    };

    const getPostRatingsForPost = () => {
        /*here an API call is made to the post-ratings controller and a list of post ratings is returned;
      the rating object contains postId, userId and rating ( either 1 or -1 ); */

        PostRatingAPI.getCombinedPostRatingsByUrl(postUrl).then((response) => {
            if (response.status === 200) {
                setCombinedPostRatings(response.data)
            } else {
                console.log("couldn't load post ratings");
            }
        });
    };

    const getUserPostRatingByPostUrl = () => {
        /*here an API call is made to the post-ratings controller and a post rating object is returned;
        the rating object contains postId, userId and rating */
        if (
            validateAccessTokenAndReturnUser() !== null
        ) {
            PostRatingAPI.getPostRatingFromUserByUrl(localStorage.getItem("accessToken"), validateAccessTokenAndReturnUser().userId, postUrl).then((response) => {
                if (
                    response.status === 200
                ) {
                    setUserPostRating(response.data.postRating);
                } else {
                    console.log("couldn't load post ratings");
                }
            });
        } else {
            //do nothing
        }
    };

    useEffect(() => {
        if (postUrl !== undefined && postUrl !== "" && post !== undefined) {
            if (validateAccessTokenAndReturnUser !== null) {
                loadPostByUrl();
                getPostRatingsForPost();
                getUserPostRatingByPostUrl();
            } else {
                loadPostByUrl();
                getPostRatingsForPost();
            }
        }
    }, []);

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
               await PostRatingAPI.changePostRating(localStorage.getItem("accessToken"), request)
                    .then((response) => {
                        if (
                            response.status === 200
                        ) {
                            setCombinedPostRatings(
                                response.data
                            );
                            setUserPostRating(
                                {
                                    ...userPostRating,
                                    weight: ratingWeight,
                                }
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
                        setCombinedPostRatings(
                            response.data.postRatings
                        );
                        setUserPostRating(undefined);
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
                            setCombinedPostRatings(
                                response.data.postRatings
                            );
                            setUserPostRating(
                                {
                                    ratingId: response.data.ratingId,
                                    userId: user.userId,
                                    postId: postId,
                                    weight: ratingWeight
                                }
                            );
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

    return (
        <section>
            <div className="bg"></div>
            <div className="bg bg2"></div>
            <div className="bg bg3"></div>
            { validateAccessTokenAndReturnUser() !== null ?
                <div id="main-loggedin">
                    <nav className="navbar-main-loggedin">
                        <div className="dropdown" style={{position: "fixed", top: "25px",right: "15%"}}>
                            <button className="dropbtn" onClick={() => handleOpen()}>
                                <img id="pfp" src={pfp} />
                            </button>
                            <div
                                className={
                                    openDropdown
                                        ? "dropdown-content show"
                                        : "dropdown-content"
                                }style={{position: "absolute", top: "70px",right: "-110px"}}
                            >
                                <a onClick={() => handleOpen()} href="/account">
                                    <FontAwesomeIcon icon={solid("user")} /> Account
                                </a>
                                <a onClick={() => handleOpen()} href="/settings">
                                    <FontAwesomeIcon icon={solid("cog")} spin /> Settings
                                </a>
                                <a onClick={() => handleOpen()} href="/favourites">
                        <span>
                          <FontAwesomeIcon icon={solid("heart")} beat />
                        </span>
                                    Favourites
                                </a>
                                <a
                                    onClick={() => handleLogout()}
                                    id="logout-opt"
                                    href={`/post/view/${postUrl}`}
                                >
                                    <FontAwesomeIcon icon={solid("right-from-bracket")} />
                                    Log out
                                </a>
                            </div>
                        </div>
                    </nav>
                </div>
             :
                <>
                <div id="main-buttons">
                <nav className="navbar-main-buttons" style={{position: "absolute", top: "40px",right: "8%"}}>
                <button id="login" onClick={() => handleShowLogin()}>
                <a>Log-in</a>
                </button>
                <button id="signup" onClick={() => handleShowRegister()}>
                Sign-up
                </button>
                </nav>
                </div>
                <LoginModal show={showLogin} onHide={handleCloseLogin} />
                <RegisterModal
                show={showRegister}
                onHide={handleCloseRegister}
                />
                </>
            }

            <Stack spacing={2} sx={{position: "fixed", left: "20%", top: "10%"}}>
                {validateAccessTokenAndReturnUser !== null ? <>
                        <Chip
                            label={combinedPostRatings !== undefined ? combinedPostRatings.upvoteCount : 0}
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
                                    id={userPostRating !== undefined && userPostRating.weight > 0 ? "upvoted" : "upvote"}
                                    component={ButtonBase}
                                    onClick={() =>
                                        // userPostRating !== undefined && userPostRating.weight > 0 ?
                                        //     handleRemoveVote(userPostRating.ratingId, post.postId) :
                                        //     userPostRating !== undefined && userPostRating.weight < 0 ?
                                        //         handleChangePostRating(userPostRating.ratingId, post.postId, 1) :
                                        //         handleRatePost(post.postId, 1)
                                        userPostRating !== undefined ? (userPostRating.weight > 0 ?
                                                handleRemoveVote(userPostRating.ratingId, post.postId) :
                                                handleChangePostRating(userPostRating.ratingId, post.postId, 1)) :
                                            handleRatePost(post.postId, 1)
                                    }
                                >
                                    {userPostRating !== undefined && userPostRating.weight > 0 ? <ThumbUp/> :
                                        <ThumbUpOutlined/>}
                                </Avatar>
                            }
                        />
                        <Chip
                            label={combinedPostRatings !== undefined ? combinedPostRatings.downvoteCount : 0}
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
                                    id={userPostRating !== undefined && userPostRating.weight < 0 ? "downvoted" : "downvote"}
                                    component={ButtonBase}
                                    onClick={() =>
                                        userPostRating !== undefined ? (userPostRating.weight < 0 ?
                                            handleRemoveVote(userPostRating.ratingId, post.postId) :
                                                handleChangePostRating(userPostRating.ratingId, post.postId, -1)) :
                                               handleRatePost(post.postId, -1)
                                    }
                                >
                                    {userPostRating !== undefined && userPostRating.weight < 0 ? <ThumbDown/> :
                                        <ThumbDownAltOutlined/>}
                                </Avatar>
                            }
                        />
                    </>
                    : <>
                        <Chip
                            label={combinedPostRatings !== undefined ? combinedPostRatings.upvoteCount : 0}
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
                                    onClick={() => {}}
                                >
                                        <ThumbUpOutlined/>
                                </Avatar>
                            }
                        />
                        <Chip
                            label={combinedPostRatings !== undefined ? combinedPostRatings.downvoteCount : 0}
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
                                    id={"downvote"}
                                    component={ButtonBase}
                                    onClick={() => {}}
                                >
                                    <ThumbDownAltOutlined/>
                                </Avatar>
                            }
                        />
                    </>}
                <Chip
                    label={0}
                    variant="filled"
                    sx={{
                        height: "60px",
                        borderRadius: "3rem",
                        color: "white",
                        width: "133px",
                        justifyContent: "flex-start",
                        textShadow: "1px 1px 3px #000000b7",
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
                        <Share/>
                    </Avatar>
                </Tooltip>
            </Stack>


            {/* end of button ribbon */}
            {/* the post */}
            <Container
                fixed
                sx={{
                    position: "absolute",
                    zIndex: -1,
                    display: "grid",
                    left: "30.5%",
                    top: "0px",
                    width: "725px",
                    height: "fit-content",
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    paddingTop: "0px",
                    paddingBottom: "0px",
                    justifyItems: "center",
                    justifyContent: "center",
                }}
            >
                {post === undefined ? (
                    <Card
                        sx={{
                            position: "absolute",
                            left: "25%",
                            top: "25px",
                            width: "645px",
                            height: "480px",
                            marginLeft: "10px",
                            marginRigh: "10px",
                            backgroundColor: "#ffffffb3",
                        }}
                    >
                        <CardHeader
                            title={
                                <Skeleton
                                    variant="rounded"
                                    width={610}
                                    height={30}
                                ></Skeleton>
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
                ) : (
                    <Card
                        key={post.postId}
                        sx={{
                            maxWidth: 645,
                            left: "25%",
                            width: 645,
                            height: "fit-content",
                            minHeight: "300px",
                            marginTop: "25px",
                            marginBottom: "10px",
                            background:
                                "linear-gradient(to bottom, #00c3ff43, #70cb1b30)",
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
                            action={
                                validateAccessTokenAndReturnUser() !== null ?
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
                            sx={{maxWidth: "605px",
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
                        <CardContent></CardContent>

                        <CardActions></CardActions>
                    </Card>
                )}

            </Container>
            <Snackbar
                open={openFailedDeletionSnackbar}
                autoHideDuration={1000}
                onClose={toggleFailedDeletionSnackbar}
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
        </section>
    );
};

export default ViewPostPage;
