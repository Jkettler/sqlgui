import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import axios from "axios";
import { getAndSetUser } from "./withAuthSync";

const AuthModal = ({ setUser, setJwt }) => {
  const [userData, setUserData] = useState({
    name: "",
    password: "",
    error: null,
  });

  const [formAction, setFormAction] = useState("login");
  const apiUrl = "http://localhost:9000";
  const [loggingIn, setLoggingIn] = useState(false);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { name, password } = userData;
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setUserData((inputs) => ({ ...inputs, [name]: value }));
  }

  const auth = async (name, password, urlAction) => {
    return axios
      .post(
        `${apiUrl}/${urlAction}`,
        {
          name,
          password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        if (urlAction === "register") {
          auth(userData.name, userData.password, "login").then(
            (res) => res.data
          );
        }
        return res.data;
      });
  };

  function handleSubmit(e) {
    e.preventDefault();
    setLoggingIn(true);
    setSubmitted(true);

    if (name && password) {
      auth(userData.name, userData.password, formAction)
        .then((res) => {
          setJwt(res);
          getAndSetUser(setUser);
          return res;
        })
        .catch((e) => {
          if (e.response) {
            const {
              output: {
                payload: { message },
              },
            } = e.response.data;

            setUserData({
              ...userData,
              error: message,
            });
          } else {
            setUserData({
              ...userData,
              error: e,
            });
          }
        });
    }
    setLoggingIn(false);
  }

  const authOptions = [
    { name: "Login", value: "login" },
    { name: "Sign Up", value: "register" },
  ];

  const modalTitle = formAction === "login" ? "Login" : "Sign Up";

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Log In to Save Your Work
      </Button>

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
                    className={
                      "form-control" + (submitted && !name ? " is-invalid" : "")
                    }
                  />
                  {submitted && !name && (
                    <div className="invalid-feedback">Username is required</div>
                  )}
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    className={
                      "form-control" +
                      (submitted && !password ? " is-invalid" : "")
                    }
                  />
                  {submitted && !password && (
                    <div className="invalid-feedback">Password is required</div>
                  )}
                </Form.Group>
                {userData.error && (
                  <Alert variant="danger">{`${userData.error}`}</Alert>
                )}
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={handleSubmit} className="btn btn-primary">
                {loggingIn && (
                  <span className="spinner-border spinner-border-sm mr-1" />
                )}
                {modalTitle}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Container>
      </Modal>
    </>
  );
};

export default AuthModal;
