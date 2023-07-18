import React, {useEffect, useState, useContext} from "react";
import "./CreatePost.css";
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCollapse,
    MDBCol,
    MDBRow,
    MDBInput,
} from "mdb-react-ui-kit";
import {
    Chip,
    Avatar,
    Button,
    TextField,
    IconButton,
    FormGroup,
    FormControl,
    FormLabel,
    Box,
    Backdrop,
    Modal,
    Fade,
    Typography,
    Skeleton,
    Badge,
    InputAdornment,
    Alert,
    Snackbar,
} from "@mui/material";
import axios from "axios";
import CategoryAPI from "../../apis/CategoryAPI";
import {bgcolor} from "@mui/system";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CancelIcon from "@mui/icons-material/Cancel";
import SendIcon from "@mui/icons-material/Send";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import PublishIcon from "@mui/icons-material/Publish";
import {LoginContext} from "../../context/LoginProvider";
import PostAPI from "../../apis/PostAPI";
import jwt_decode from "jwt-decode";

export const CreatePost = ({onNewPost}) => {
    const [postTitle, setPostTitle] = useState("");
    const [validPostTitle, setValidPostTitle] = useState(false);
    const [validImgUrl, setValidImgUrl] = useState(false);

    const [titleCount, setTitleCount] = useState(0);
    const [urlCount, setUrlCount] = useState(0);

    const [explicit, setExplicit] = useState(false);
    const [categoryId, setCategoryId] = useState(0);
    const [imgUrl, setImgUrl] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loginState, loginDispatch] = useContext(LoginContext);
    // const [alertType, setAlertType] = useState("none");
    const [openForm, setOpenForm] = useState(false);

    const [openCancelModal, setOpenCancelModal] = React.useState(false);

    const [openWarningSnackbar, setOpenWarningSnackbar] = React.useState(false);
    const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
    const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);

    const toggleCancelModal = () => {
        setOpenCancelModal(!openCancelModal);
    };

    const toggleWarningSnackbar = () => {
        setOpenWarningSnackbar(!openWarningSnackbar);
    };

    const toggleSuccessSnackbar = () => {
        setOpenSuccessSnackbar(!openSuccessSnackbar);
    };

    const toggleErrorSnackbar = () => {
        setOpenErrorSnackbar(!openErrorSnackbar);
    };

    const images = importAllImages(
        require.context("../../assets/img/icons/", true)
    );
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
                setOpenForm(false);
                handleFormCleanup();
                alert("Access expired :S");
                loginDispatch({type: "expired"});
                return null;
            }
        } else {
            return null;
        }
    };
    const toggleOpenForm = () => {
        if (
            validateAccessTokenAndReturnUser() !== null
        ) {
            if (openForm) {
                if (openCancelModal) {
                    handleFormCleanup();
                    setOpenCancelModal(!openCancelModal);
                    setOpenForm(!openForm);
                } else {
                    if (postTitle == "" && imgUrl == "" && selectedCategory == "") {
                        setOpenForm(!openForm);
                    } else {
                        toggleCancelModal();
                    }
                }
            } else {
                setOpenForm(!openForm);
            }
        } else {
            if (openForm) {
                handleFormCleanup();
                setOpenForm(!openForm);
            } else {
                toggleWarningSnackbar();
            }
        }
    };

    const handleFormCleanup = () => {
        setSelectedCategory("");
        setImgUrl("");
        setPostTitle("");
        setCategoryId(0);
    };

    const handleUpdateActiveCategory = (value) => {
        setSelectedCategory(value);
    };

    function importAllImages(temp) {
        let images = {};
        temp.keys().map((image) => {
            images[image.replace("./", "")] = temp(image);
        });
        return images;
    }

    const getCategories = () => {
        CategoryAPI.getCategories()
            .then((response) => {
                setCategories(response.data.categories);
            })
            .catch((err) => console.error(err));
    };

    const getCategoryByName = (categoryName) => {
        if (categoryName !== "" && categoryName !== undefined) {
            CategoryAPI.getCategoryByName()
                .then((response) => {
                    setCategoryId(response.data.category.categoryId);
                })
                .catch((err) => console.error(err));
        }
    };

    useEffect(() => {
        if (openForm) {
            getCategories();
        }
    }, [openForm]);


    const formatString = (stringToFormat) => {
        return stringToFormat
            .toLowerCase()
            .trim()
            .replace("-", "")
            .replace(" ", "");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (
                validateAccessTokenAndReturnUser() !== null
            ) {
                if (validPostTitle && selectedCategory !== "" && validImgUrl) {
                    const user = validateAccessTokenAndReturnUser();
                    const response = await PostAPI.createPost(localStorage.getItem("accessToken"),
                        {
                            "authorId": user.userId,
                            "categoryId": categoryId,
                            "postTitle": postTitle,
                            "mediaAddress": imgUrl,
                            "explicit": explicit
                        })
                    if (response.status === 201) {
                        toggleSuccessSnackbar();
                        handleFormCleanup();
                        setOpenForm(false);
                        onNewPost(response.data);
                    } else {
                        toggleErrorSnackbar();
                    }
                }
            } else {
                toggleWarningSnackbar();
            }
        } catch (error) {
            toggleErrorSnackbar();
        }
    };

    const getTitleValidationColor = () => {
        if (titleCount == 0) {
            setValidPostTitle(false);
            return "gray";
        } else if (titleCount < 2) {
            setValidPostTitle(false);
            return "rgb(245, 159, 0)";
        } else if (titleCount < 140) {
            setValidPostTitle(true);
            return "rgb(102, 187, 106)";
        } else if (titleCount == 140) {
            setValidPostTitle(true);
            return "rgb(220, 53, 69)";
        } else {
            setValidPostTitle(false);
            return "rgb(220, 53, 69)";
        }
    };

    const getUrlValidationColor = () => {
        if (urlCount == 0) {
            setValidImgUrl(false);
            return "gray";
        } else if (urlCount < 10) {
            setValidImgUrl(false);
            return "rgb(245, 159, 0)";
        } else if (urlCount < 150) {
            setValidImgUrl(true);
            return "rgb(102, 187, 106)";
        } else if (urlCount == 150) {
            setValidImgUrl(true);
            return "rgb(220, 53, 69)";
        } else {
            setValidImgUrl(false);
            return "rgb(220, 53, 69)";
        }
    };

    useEffect(() => {
        setTitleCount(`${postTitle.length}`);
    }, [postTitle]);

    useEffect(() => {
        setUrlCount(`${imgUrl.length}`);
    }, [imgUrl]);

    return (
        <section className="create-post-container">
            <Chip
                clickable={true}
                onClick={toggleOpenForm}
                icon={<PublishIcon/>}
                label="Post"
                color="primary"
                sx={{
                    position: "fixed",
                    right: "1%",
                    top: "105px",
                    boxShadow: "0 0 10px 0 rgba(43, 46, 45, 0.961)",
                    zIndex: "-1",
                }}
            />
            <Modal
                open={openForm}
                disableEscapeKeyDown={true}
                // onClose={(event, reason) => {reason: "", toggleOpenForm}}
                closeAfterTransition
                // sx={{ overflow: "scroll" }}
            >
                <Fade in={openForm}>
                    <MDBCard>
                        <MDBCardBody>
                            <MDBRow style={{height: "fit-content", width: "fit-content"}}>
                                <MDBCol>
                                    <TextField
                                        id="post-title"
                                        label="Post title"
                                        placeholder="A captivating and meaningful title"
                                        multiline
                                        variant="filled"
                                        value={postTitle}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 140) {
                                                setPostTitle(e.target.value);
                                            } else {
                                                setPostTitle(e.target.value.substring(0, 140));
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <Chip
                                                    variant="filled"
                                                    label={titleCount}
                                                    sx={{
                                                        backgroundColor: getTitleValidationColor,
                                                        marginTop: "-12px",
                                                        alignSelf: "center",
                                                        fontWeight: "bolder",
                                                    }}
                                                />
                                            ),
                                        }}
                                        sx={{
                                            width: "630px",
                                            maxHeight: "96px",
                                            overflow: "auto",
                                            margin: "10px",
                                            marginTop: "20px",
                                            borderRadius: "20px",

                                            padding: "2px",
                                        }}
                                    />
                                </MDBCol>
                            </MDBRow>
                            <MDBRow style={{height: "fit-content", width: "fit-content"}}>
                                <MDBCol>
                                    <TextField
                                        id="img-url"
                                        label="Image url"
                                        variant="filled"
                                        placeholder="https://..."
                                        value={imgUrl}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 150) {
                                                setImgUrl(e.target.value);
                                            } else {
                                                setImgUrl(e.target.value.substring(0, 150));
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <Chip
                                                    variant="filled"
                                                    label={urlCount}
                                                    sx={{
                                                        backgroundColor: getUrlValidationColor,
                                                        marginTop: "5px",
                                                        marginLeft: "5px",
                                                        fontWeight: "bolder",
                                                    }}
                                                />
                                            ),
                                        }}
                                        sx={{
                                            width: "450px",
                                            maxHeight: "96px",
                                            overflow: "auto",
                                            margin: "10px",
                                            borderRadius: "20px",
                                        }}
                                    />
                                </MDBCol>
                                <MDBCol style={{paddingTop: "5px", paddingBottom: "5px"}}>
                                    <Button
                                        variant="contained"
                                        endIcon={<AddPhotoAlternateIcon/>}
                                        component="label"
                                        size="large"
                                        sx={{
                                            marginLeft: "10px",
                                            marginRight: "10px",
                                            marginTop: "12px",
                                            borderRadius: "2rem",
                                        }}
                                    >
                                        Upload
                                        <input hidden accept="image/*" multiple type="file"/>
                                    </Button>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow
                                style={{
                                    height: "fit-content",
                                    width: "fit-content",
                                    marginTop: "10px",
                                }}
                            >
                                <MDBCol>
                                    {/* <label htmlFor="postCategory">Post Category:</label> */}
                                    <FormControl
                                        sx={{m: 3}}
                                        component="fieldset"
                                        variant="standard"
                                    >
                                        <FormLabel component="legend">Post category</FormLabel>
                                        <FormGroup
                                            sx={{
                                                display: "inline-block",
                                                width: "620px",
                                                maxHeight: "140px",
                                                overflow: "scroll",
                                            }}
                                        >
                                            {categories.length === 0 ? (
                                                <Skeleton
                                                    variant="rectangular"
                                                    width={190}
                                                    height={45}
                                                    sx={{borderRadius: "2rem", margin: "0.25rem"}}
                                                />
                                            ) : (
                                                categories.map((category) => {
                                                    const categoryName = category.categoryName;
                                                    return (
                                                        <Chip
                                                            className="categoryChip"
                                                            key={categoryName}
                                                            avatar={
                                                                <Avatar
                                                                    id="chipAvatar"
                                                                    alt={formatString(categoryName)}
                                                                    src={
                                                                        images[
                                                                            `${formatString(
                                                                                categoryName
                                                                            )}.png`
                                                                            ]
                                                                    }
                                                                />
                                                            }
                                                            label={categoryName}
                                                            variant="filled"
                                                            id={
                                                                selectedCategory === categoryName
                                                                    ? "active"
                                                                    : ""
                                                            }
                                                            clickable={true}
                                                            onClick={() => {
                                                                handleUpdateActiveCategory(categoryName);
                                                                setCategoryId(category.categoryId);
                                                            }
                                                            }
                                                            sx={{
                                                                marginLeft: "2px",
                                                                marginRight: "5px",
                                                                marginTop: "5px",
                                                                marginBottom: "5px",
                                                                paddingLeft: "0px",
                                                                paddingRight: "0px",
                                                                paddingTop: "4px",
                                                                paddingBottom: "4px",
                                                            }}
                                                        />
                                                    );
                                                })
                                            )}
                                        </FormGroup>
                                    </FormControl>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow
                                style={{
                                    paddingTop: "5px",
                                    paddingBottom: "5px",
                                }}
                                around
                            >
                                <MDBCol
                                    md="2"
                                    style={{
                                        height: "fit-content",
                                        width: "fit-content",
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        endIcon={<CancelIcon/>}
                                        size="large"
                                        sx={{
                                            marginLeft: "10px",
                                            marginRight: "10px",
                                            marginTop: "22px",
                                            borderRadius: "2rem",
                                        }}
                                        onClick={() => toggleOpenForm()}
                                    >
                                        Close
                                    </Button>
                                </MDBCol>
                                <MDBCol
                                    md="2"
                                    style={{
                                        height: "fit-content",
                                        width: "fit-content",
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                        alignItems: "end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        sx={{
                                            marginLeft: "10px",
                                            marginRight: "10px",
                                            marginTop: "22px",
                                            borderRadius: "2rem",
                                        }}
                                        disabled={
                                            validPostTitle && validImgUrl && selectedCategory !== ""
                                                ? false
                                                : true
                                        }
                                        endIcon={<SendIcon/>}
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </Button>
                                </MDBCol>
                            </MDBRow>
                            {/* </MDBCollapse> */}
                        </MDBCardBody>
                    </MDBCard>
                </Fade>
            </Modal>
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
                autoHideDuration={1000}
                onClose={toggleErrorSnackbar}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    onClose={toggleErrorSnackbar}
                    severity={"error"}
                    sx={{width: "100%"}}
                >
                    Upload failed!
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
                            This will discard your input!
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
                            onClick={() => toggleOpenForm()}
                        >
                            Yes
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </section>
    );
};
export default CreatePost;
