import React, { Component, useContext } from "react";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Form,
  Card,
  Container,
  InputGroup,
  Image,
  Button,
} from "@themesberg/react-bootstrap";
import ReactLogo from "../assets/img/technologies/logo.svg";
import { domainPath } from "../constants/utils";
import BgImage from "../assets/img/illustrations/signin.svg";
import { TabTitle } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";
import { Routes } from "../routes";

export default class Signin extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }

  handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState((prevstate) => {
      const newState = { ...prevstate };
      newState[name] = value;
      return newState;
    });
  };

  handleLogin = (e, data) => {
    e.preventDefault();
    fetch(domainPath + "token-auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.token) {
          localStorage.setItem('token',json.token);
          localStorage.setItem('userName', json.user.username);
          this.props.history.push("/");
        } else {
          alert("Votre compte utilisateur est invalide");
        }
      })
      .catch((err) => alert(err));
  };

  render() {
    TabTitle("Se connecter");

    return (
      <main className="bg-dark vh-100">
        <section className="d-flex align-items-center my-5 mt-lg-8 mb-lg-5">
          <Container>
            <Row
              className="justify-content-center form-bg-image"
              style={{ backgroundImage: `url(${BgImage})` }}
            >
              <Col
                xs={12}
                className="d-flex align-items-center justify-content-center"
              >
                <div className="bg-white shadow-soft border rounded border-primary p-4 p-lg-5 w-100 fmxw-500">
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">Se connecter à RecomSys</h3>
                  </div>
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <Image className="" src={ReactLogo} height={80} />
                  </div>
                  <Form
                    className="mt-4"
                    onSubmit={(e) => this.handleLogin(e, this.state)}
                  >
                    <Form.Group id="email" className="mb-4">
                      <Form.Label>Nom d'utilisateur</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                        <Form.Control
                          autoFocus
                          required
                          type="text"
                          placeholder="example@company.com"
                          name="username"
                          value={this.state.username}
                          onChange={this.handleChange}
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group>
                      <Form.Group id="password" className="mb-4">
                        <Form.Label>Mot de passe</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUnlockAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={this.state.password}
                            onChange={this.handleChange}
                          />
                        </InputGroup>
                      </Form.Group>
                      {/* <div className="d-flex justify-content-center align-items-center mb-4">
                        <Card.Link  as={Link} to={Routes.ForgotPassword.path} className="small">
                          Forget password?
                        </Card.Link>
                      </div> */}
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                      Se connecter
                    </Button>
                    <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Create new account? 
                    <Card.Link as={Link} to={Routes.Signup.path} className="fw-bold">
                      {` Sign up `}
                    </Card.Link>
                  </span>
                </div>
                  </Form>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    );
  }
}
