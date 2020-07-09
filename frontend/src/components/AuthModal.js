import React, { useState } from "react";
import {
  Modal,
  Form,
  Container,
  Alert,
  ButtonGroup,
  ToggleButton,
  Spinner,
} from "react-bootstrap";

import authService from "../util/authService";
import { JwtProvider, useJwt } from "../contexts/JwtContext";
import NoFocusButton from "./NoFocusButton";

const AuthModal = () => {
  const [userData, setUserData] = useState({
    name: "",
    password: "",
    error: null,
  });

  const { setJwt } = useJwt();
  const [formAction, setFormAction] = useState("login");
  const [loggingIn, setLoggingIn] = useState(false);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { name, password } = userData;
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((inputs) => ({ ...inputs, [name]: value }));
  };

  const showErrors = (err) => {
    if (err.response) {
      const {
        output: {
          payload: { message },
        },
      } = err.response.data;

      setUserData({
        ...userData,
        error: message,
      });
    } else {
      setUserData({
        ...userData,
        error: err,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (name && password) {
      setLoggingIn(true);

      if (formAction === "login") {
        authService.auth
          .userLogin(
            {
              name,
              password,
            },
            setJwt
          )
          .catch((err) => {
            showErrors(err);
          })
          .then(() => {
            setLoggingIn(false);
          });
      } else if (formAction === "register") {
        authService.auth
          .userRegister(
            {
              name,
              password,
            },
            setJwt
          )
          .catch((err) => {
            showErrors(err);
          })
          .then(() => {
            setLoggingIn(false);
          });
      }
    }
  };

  const authOptions = [
    { name: "Login", value: "login" },
    { name: "Sign Up", value: "register" },
  ];

  const modalTitle = formAction === "login" ? "Login" : "Sign Up";

  return (
    <JwtProvider>
      <NoFocusButton variant="primary" onClick={handleShow}>
        Log In to Save Your Work
      </NoFocusButton>

      <Modal show={show} centered onHide={handleClose} animation={false}>
        <ButtonGroup toggle className="AuthModalToggle">
          {authOptions.map((radio, idx) => (
            <ToggleButton
              key={idx}
              type="radio"
              variant="info"
              name="radio"
              value={radio.value}
              checked={formAction === radio.value}
              onChange={(e) => setFormAction(e.currentTarget.value)}
            >
              {radio.name}
            </ToggleButton>
          ))}
        </ButtonGroup>

        <Container fluid>
          <Modal.Dialog>
            <Modal.Header closeButton>
              <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    isInvalid={submitted && !name}
                  />
                  {submitted && !name && (
                    <Alert variant="danger">Username is required</Alert>
                  )}
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    isInvalid={submitted && !password}
                  />
                  {submitted && !password && (
                    <Alert variant="danger">Password is required</Alert>
                  )}
                </Form.Group>
                {userData.error && (
                  <Alert variant="danger">{`${userData.error}`}</Alert>
                )}
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <NoFocusButton onClick={handleSubmit} className="btn btn-primary">
                {loggingIn ? (
                  <Spinner
                    as={"span"}
                    animation="grow"
                    variant="primary"
                    size="sm"
                  />
                ) : (
                  <span>{modalTitle}</span>
                )}
              </NoFocusButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Container>
      </Modal>
    </JwtProvider>
  );
};

export default AuthModal;
