import {Navbar, Nav} from "react-bootstrap";
import React, {useRef} from "react";
import {useState, useEffect, Component, useContext} from "react";
import logo from "../../../assets/img/logo.png";
import search from "../../../assets/img/icons/search.png";
import "./MainNav.css";
import SortingGroupAPI from "../../../apis/SortingGroupAPI";
import UserAPI from "../../../apis/UserAPI";
// import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import LoginModal from "../../ModalBoxes/Login";
import RegisterModal from "../../ModalBoxes/Register";
// import AuthContext from "../../../context/AuthProvider";
import Dropdown from "react-bootstrap/Dropdown";
import SplitButton from "react-bootstrap/SplitButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    solid,
    regular,
    brands,
    icon,
} from "@fortawesome/fontawesome-svg-core/import.macro";
import {LoginContext} from "../../../context/LoginProvider";
import jwt_decode from "jwt-decode";
import {ActiveSortingGroupContext} from "../../../context/ActiveSortinGroupProvider";
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

export const MainNav = (props) => {
    const [sortingGroups, setSortingGroups] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [loginState, loginDispatch] = useContext(LoginContext);
    const [activeGroupState, activeGroupDispatch] = useContext(
        ActiveSortingGroupContext
    );
    const [openDropdown, setOpenDropdown] = React.useState(false);
    const [pfp, setPfp] = useState("/");

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

    const handleLogout = () => {
        handleOpen();
        loginDispatch({type: "logout"});
    };

    const handleActiveGroup = (groupName) => {
        activeGroupDispatch({type: groupName});
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


    const refreshSortingGroups = () => {
        SortingGroupAPI.getGroups()
            .then((response) => {
                setSortingGroups(response.data.groups);
            })
            .catch((err) => console.error(err));
    };

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
        refreshSortingGroups();
    }, []);

    useEffect(() => {
        if (loginState.loggedIn === true) {
            getPfp();
        }
    }, [loginState]);

    return (
        <>
            {validateAccessTokenAndReturnUser() !== null ? (
                <>
                    {/* when user is logged in */}
                    <Navbar className="navbar-main">
                        <Navbar.Brand href="/">
                            <img src={logo} alt="Logo"/>
                        </Navbar.Brand>
                        <nav className="navbar-main-items">
                            <ul className="tiers">
                                {sortingGroups.map((sortingGroup) => {
                                    return (
                                        <li className="nav-menu" key={sortingGroup.groupId}>
                                            <Nav.Item
                                                className="nav-links"
                                                id={
                                                    activeGroupState.activeGroup ===
                                                    sortingGroup.groupName
                                                        ? "active"
                                                        : ""
                                                }
                                                href={sortingGroup.groupName
                                                    .toLowerCase()
                                                    .trim()
                                                    .replace("-", "")
                                                    .replace(" ", "")}
                                                onClick={() =>
                                                    handleActiveGroup(sortingGroup.groupName)
                                                }
                                            >
                                                {sortingGroup.groupName}
                                            </Nav.Item>
                                        </li>
                                    );
                                })}
                            </ul>
                            {/* <nav className="navbar-main-search">
                            <input type="text" className="searchbox-main" placeholder="search..."></input>
                            <img src={search} alt="search"></img>
                        </nav> */}
                            {/* <nav className="navbar-main-icons">

                            </nav>  */}
                            <div id="main-loggedin">
                                <nav className="navbar-main-loggedin">

                                        <Chip sx={{
                                        '&:hover': {
                                            color: "#0288d1",
                                            bgcolor: "#FFFFFF",

                                        }, boxShadow: "0 0 10px 0 rgba(43, 46, 45, 0.961)",
                                        top: "20px", right: "90px", position: "fixed", display: validateAccessTokenAndReturnUser().userRole === 'ADMIN' ? "inline-flex" : "none"
                                    }} icon={<AdminPanelSettingsRoundedIcon/>} label="Admin" component="a"
                                          href="/administrator"
                                          color="info" clickable/>

                                     <div className="dropdown" style={{float: "right"}}>
                                        <button className="dropbtn" onClick={() => handleOpen()}>
                                            <img id="pfp" src={pfp}/>
                                        </button>
                                        <div
                                            className={
                                                openDropdown
                                                    ? "dropdown-content show"
                                                    : "dropdown-content"
                                            }
                                        >
                                            <a onClick={() => handleOpen()} href="/account">
                                                <FontAwesomeIcon icon={solid("user")}/> Account
                                            </a>
                                            <a onClick={() => handleOpen()} href="/settings">
                                                <FontAwesomeIcon icon={solid("cog")} spin/> Settings
                                            </a>
                                            <a onClick={() => handleOpen()} href="/favourites">
                        <span>
                          <FontAwesomeIcon icon={solid("heart")} beat/>
                        </span>
                                                Favourites
                                            </a>
                                            <a
                                                onClick={() => handleLogout()}
                                                id="logout-opt"
                                                href="/"
                                            >
                                                <FontAwesomeIcon icon={solid("right-from-bracket")}/>
                                                Log out
                                            </a>
                                        </div>
                                    </div>
                                </nav>
                            </div>
                        </nav>
                    </Navbar>
                </>
            ) : (
                <>
                    {/* when user is not logged in */}
                    <Navbar className="navbar-main" fixed="top">
                        <Navbar.Brand href="/">
                            <img src={logo} alt="Logo"/>
                        </Navbar.Brand>
                        <nav className="navbar-main-items">
                            <ul className="tiers">
                                {sortingGroups.map((sortingGroup) => {
                                    return (
                                        <li className="nav-menu" key={sortingGroup.groupRank}>
                                            <Nav.Item
                                                className="nav-links"
                                                id={
                                                    activeGroupState.activeGroup ===
                                                    sortingGroup.groupName
                                                        ? "active"
                                                        : ""
                                                }
                                                href={sortingGroup.groupName
                                                    .toLowerCase()
                                                    .trim()
                                                    .replace("-", "")
                                                    .replace(" ", "")}
                                                onClick={() =>
                                                    handleActiveGroup(sortingGroup.groupName)
                                                }
                                            >
                                                {sortingGroup.groupName}
                                            </Nav.Item>
                                        </li>
                                    );
                                })}
                            </ul>
                            {/* <nav className="navbar-main-search">
                            <input type="text" className="searchbox-main" placeholder="search..."></input>
                            <img src={search} alt="search"></img>
                        </nav> */}
                            {/* <nav className="navbar-main-icons"> </nav> */}

                            <div id="main-buttons">
                                <nav className="navbar-main-buttons">
                                    <button id="login" onClick={() => handleShowLogin()}>
                                        <a>Log-in</a>
                                    </button>
                                    <button id="signup" onClick={() => handleShowRegister()}>
                                        Sign-up
                                    </button>
                                </nav>
                            </div>
                        </nav>
                        <LoginModal show={showLogin} onHide={handleCloseLogin}/>
                        <RegisterModal
                            show={showRegister}
                            onHide={handleCloseRegister}
                        />
                    </Navbar>
                </>
            )}
        </>
    );
};

export default MainNav;
