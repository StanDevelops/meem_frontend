import { Component, createRef, useCallback } from "react";
import React, { useState, useEffect, useRef, useContext } from "react";
import "./Modal.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Col, Form } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import loginImg from "../../assets/img/awesome-girl-removedbg.png";
import useAuth from "../../hooks/useAuth";
import UserAPI from "../../apis/UserAPI";
import AuthAPI from "../../apis/AuthAPI";
import jwt_decode from "jwt-decode";
import { LoginContext } from "../../context/LoginProvider";
import {
  faXmark,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthContext from "../../context/AuthProvider";

// const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^\.&*]).{8,24}$/;
const EMAIL_REGEX =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export const LoginModal = (props) => {
  // const [validPwd, setValidPwd] = useState(false);

  const [email, setEmail] = useState("");
  const [authority, setAuthority] = useState("");

  const [emailFocus, setEmailFocus] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState(0);
  const [loginState, loginDispatch] = useContext(LoginContext);

  // const [banned, setBanned] = useState(false);
  // const [modPrivilege, setModPrivilege] = useState(false);
  const [pwd, setPwd] = useState("");
  // const [pwdFocus, setPwdFocus] = useState(false);
  // const [emailFocus, setEmailFocus] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  // const [auth, setAuth] = AuthContext();

  const mailRef = useRef("");
  const errRef = useRef("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(email, pwd);

    try {
      if (validEmail && pwd.length > 0) {
        const loginRequest = {
          email: email,
          password: pwd,
        };
        const response = await AuthAPI.loginUser(loginRequest);
        console.log(response);
        if (response.data.accessToken != "" && response.status != 404) {
          const accessToken = response.data.accessToken;
          localStorage.setItem("accessToken", accessToken);

          setEmail("");
          setPwd("");
          props.onHide();
          loginDispatch({ type: "login" });
          document.getElementById("failed_login").className = "offscreen";
        } else {
          document.getElementById("failed_login").className = "failed";
        }
      }
    } catch (error) {
      console.log(error);
      document.getElementById("failed_login").className = "failed";
    }
  };

  const hideLoginFail = () => {
    document.getElementById("failed_login").className = "offscreen";
  };

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  // useEffect(() => {
  //   setValidEmail(EMAIL_REGEX.test(email));
  // }, [email]);

  return (
    // <>
    //   {loginState.loggedIn ? (
    //     <Modal
    //       show={props.show}
    //       onHide={props.onHide}
    //       backdrop="static"
    //       keyboard={false}
    //     >
    //       <Modal.Header>
    //         <Modal.Title>
    //           <img src="https://i.gifer.com/Es0.gif" />
    //           <h1>Logged in! :)</h1>
    //         </Modal.Title>
    //       </Modal.Header>
    //       <Modal.Footer>
    //         <Button id="close" variant="danger" onClick={props.onHide}>
    //           Close
    //         </Button>
    //       </Modal.Footer>
    //     </Modal>
    //   ) : (
    <Modal
      show={props.show}
      onHide={props.onHide}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>
          <img src={loginImg} />
          <h1>Log in!</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3 justify-content-center align-items-center">
            <Form.Group as={Col} md="10">
              <InputGroup>
                <Form.Control
                  required
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="off"
                  placeholder="E-mail address"
                  aria-invalid={validEmail ? "false" : "true"}
                  aria-describedby="uidnote"
                  ref={mailRef}
                  onFocus={() => {
                    setEmailFocus(true);
                  }}
                  onBlur={() => setEmailFocus(false)}
                />
              </InputGroup>
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
            </Form.Group>
          </Row>
          <Row className="mb-3 justify-content-center align-items-center">
            <Form.Group as={Col} md="10">
              {/* <Form.Label>something</Form.Label> */}
              <InputGroup>
                <Form.Control
                  required
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  type="password"
                  placeholder="Password"
                />
              </InputGroup>
            </Form.Group>
          </Row>
        </Form>
        <p
          id="failed_login"
          className={"offscreen"}
          onMouseLeave={() => hideLoginFail()}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          Wrong email and password combination :({" "}
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button id="cancel" variant="danger" onClick={props.onHide}>
          Cancel
        </Button>
        <Button
          id="submit"
          type="submit"
          disabled={validEmail ? false : true}
          variant="success"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
    //   )}
    // </>
  );
};

export default LoginModal;
