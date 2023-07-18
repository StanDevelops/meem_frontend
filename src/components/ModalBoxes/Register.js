import "./Modal.css";
import { useRef, useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCheck,
  faXmark,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Col, Form } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import AuthContext from "../../context/AuthProvider";
import UserAPI from "../../apis/UserAPI";
import registerImg from "../../assets/img/anime-girl-holding-gun.png";

const USER_REGEX =
  /^(?=.{4,21}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9._-]+(?<![_.-])$/;
const PWD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$\-_\s^\.&*]).{8,24}$/;
const EMAIL_REGEX =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const PWD_REGEX2 = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,24}$/;
export const RegisterModal = (props) => {
  const userRef = useRef();
  const emailRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [activeSex, setActiveSex] = useState("U");

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [validEmail, setValidEmail] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  // const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [email, user, pwd, matchPwd]);

  const getCurrentDate = () => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    return min < 10
      ? year +
          "-" +
          month +
          "-" +
          date +
          " " +
          hours +
          ":" +
          "0" +
          min +
          ":" +
          sec
      : year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec;
    // return Date.now;
  };

  const handleSexSelection = (value) => {
    setActiveSex(value);
  };

  const handleClose = () => {
    setSuccess(false);
    props.onHide();
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    // const timestamp = getCurrentDate();
    try {
      // console.log(encodeURI(pwd));
      const response = await UserAPI.createUser(
          {
            username: user,
            email: email,
            password: pwd,
            gender: activeSex
          }
      );

      if (response.data) {
        setEmail("");
        setPwd("");
        setActiveSex("U");
        setMatchPwd("");
        setUser("");
        setSuccess(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {success ? (
        <>
          <Modal
            show={props.show}
            onHide={props.onHide}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header>
              <Modal.Title>
                <img src={registerImg} />
                <h1>Success!</h1>
              </Modal.Title>
            </Modal.Header>
            <Modal.Footer>
              <Button id="close" variant="danger" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <Modal
          show={props.show}
          onHide={props.onHide}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>
              <img src={registerImg} />
              <h1>Sign up!</h1>
              <p
                ref={errRef}
                className={errMsg ? "errmsg" : "offscreen"}
                aria-live="assertive"
              >
                {errMsg}
              </p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label htmlFor="email">
                Email:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validEmail ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faXmark}
                  className={validEmail || !email ? "hide" : "invalid"}
                />
              </label>
              <input
                type="email"
                id="email"
                ref={emailRef}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                placeholder="example@email.com"
                aria-invalid={validEmail ? "false" : "true"}
                aria-describedby="uidnote"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
              <p
                id="uidnote"
                className={
                  emailFocus && email && !validEmail
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                Incorrect email format.
              </p>
              <label htmlFor="username">
                Username:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validName ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faXmark}
                  className={validName || !user ? "hide" : "invalid"}
                />
              </label>
              <input
                type="text"
                id="username"
                placeholder="someUsername"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
                aria-invalid={validName ? "false" : "true"}
                aria-describedby="uidnote"
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
              />
              <p
                id="uidnote"
                className={
                  userFocus && user && !validName ? "instructions" : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                4 to 21 characters.
                <br />
                Must begin and end with a letter or a number. Cannot repeat
                special characters one after another.
                <br />
                Letters(a-Z), numbers(0-9), underscores(_) and hyphens(-)
                allowed.
              </p>
              <label htmlFor="sex">Sex:</label>
              <div id="sex-rbs">
                <label className="rb-content">
                  <input
                    type="radio"
                    id="rbM"
                    checked={activeSex == "M" ? true : false}
                    onChange={() => handleSexSelection("M")}
                  />{" "}
                  Male
                </label>
                <label className="rb-content">
                  <input
                    checked={activeSex == "U" ? true : false}
                    type="radio"
                    id="rbU"
                    onChange={() => handleSexSelection("U")}
                  />{" "}
                  Undisclosed
                </label>
                <label className="rb-content">
                  <input
                    checked={activeSex == "F" ? true : false}
                    type="radio"
                    id="rbF"
                    onChange={() => handleSexSelection("F")}
                  />
                  Female
                </label>
              </div>

              <label htmlFor="password">
                Password:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validPwd ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faXmark}
                  className={validPwd || !pwd ? "hide" : "invalid"}
                />
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
                aria-invalid={validPwd ? "false" : "true"}
                aria-describedby="pwdnote"
                placeholder="Som3_p@$$word"
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
              />
              <p
                id="pwdnote"
                className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                8 to 24 characters.
                <br />
                Must include uppercase and lowercase letters, a number and a
                special character.
                <br />
                Allowed special characters:{" "}
                <span aria-label="exclamation mark">!</span>{" "}
                <span aria-label="at symbol">@</span>{" "}
                <span aria-label="hashtag">#</span>{" "}
                <span aria-label="dollar sign">$</span>{" "}
                <span aria-label="ampersand">&</span>{" "}
                <span aria-label="dot">.</span> <span aria-label="up">^</span>{" "}
                {/* <span aria-label="percentage">%</span>{" "} */}
                <span aria-label="empty space">(emptyspace)</span>{" "}
              </p>

              <label htmlFor="confirm_pwd">
                Confirm Password:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validMatch && matchPwd ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faXmark}
                  className={validMatch || !matchPwd ? "hide" : "invalid"}
                />
              </label>
              <input
                type="password"
                id="confirm_pwd"
                placeholder="Som3_p@$$word"
                onChange={(e) => setMatchPwd(e.target.value)}
                value={matchPwd}
                required
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confirmnote"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
              />
              <p
                id="confirmnote"
                className={
                  matchFocus && !validMatch ? "instructions" : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                Must match the first password input field.
              </p>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button id="cancel" variant="danger" onClick={props.onHide}>
              Cancel
            </Button>
            <Button
              id="submit"
              type="submit"
              variant="success"
              onClick={handleSubmit}
              disabled={
                !validEmail || !validName || !validPwd || !validMatch
                  ? true
                  : false
              }
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default RegisterModal;
