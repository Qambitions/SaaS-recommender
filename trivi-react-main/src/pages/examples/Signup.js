
import React, {Component, useEffect} from "react";
import {Redirect} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import { domainPath } from "../../constants/utils";

import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/signin.svg";
import { AppContext } from "../AppContext";
import DnsIcon from '@mui/icons-material/Dns';


export default class Signup extends Component {

  static contextType = AppContext;


  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
      ip_address: ""

    };
  }

  componentDidMount() {
  
    this.checkAllocate();
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

  checkAllocate = () => {
    fetch(domainPath + "dimadb/check-allocate-database/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then((res) => res.json())
    .then((json) => {
      if (json.message != "available") {
        alert("We are generating new database... Please come back later!!");
        window.location.replace('http://localhost:3000/404');      
      }
      else return true;
    })
    .catch((err) => alert(err));
  }

  handleSignup = (e, data) => {
    e.preventDefault();
    fetch(domainPath + "core/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => { 
        if (res.status == 200) {
          const allocate = {
            "username": data.username, 
            "service": "", 
            "ip_address": data.ip_address
          }
          fetch(domainPath + "dimadb/allocate-database/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(allocate),
          })
            .then((res) => {
              alert(res.statusText);
            }
            )
            .catch((err) => alert(err));
            window.location.replace('http://localhost:3000');      

        }
        else {
          alert("Something wrong! Please check again!");
        }

      })
      .catch((err) => alert(err));
  };

  

 render(){
  return (
    <main className="bg-dark vh-100">
      <section className="d-flex align-items-center my-4 mt-lg-4 mb-lg-5">
        <Container>
          <p className="text-center">
            <Card.Link as={Link} to={Routes.Signin.path} className="text-gray-700">
              <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Back to log in
            </Card.Link>
          </p>
          <Row className="justify-content-center form-bg-image" style={{ backgroundImage: `url(${BgImage})` }}>
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="mb-4 mb-lg-0 bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">Create an account</h3>
                </div>
                <Form className="mt-4 text-black"
                onSubmit={(e) => this.handleSignup(e, this.state)}>
                <Form.Group id="username" className="mb-4">
                    <Form.Label className="text-black">Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control
                          autoFocus
                          required
                          type="text"
                          placeholder="admin"
                          name="username"
                          value={this.state.username}
                          onChange={this.handleChange}
                        />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <InputGroup name="email">
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="email" placeholder="example@company.com"
                      name="email"
                      value={this.state.email}
                      onChange={this.handleChange}/>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group id="password" className="mb-4">
                    <Form.Label className="text-black">Password</Form.Label>
                    <InputGroup name="password">
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
                  <Form.Group id="ipAddress" className="mb-4">
                    <Form.Label>Web Ecommerce IP Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <DnsIcon/>
                      </InputGroup.Text>
                      <Form.Control required type="text" placeholder="IP Address" 
                      onChange={this.handleChange}
                      value={this.state.ip_address}
                      name="ip_address"/>
                    </InputGroup>
                  </Form.Group>
                  <FormCheck type="checkbox" className="d-flex mb-4">
                    <FormCheck.Input required id="terms" className="me-2" />
                    <FormCheck.Label htmlFor="terms" className="text-black">
                      I agree to the <Card.Link>terms and conditions</Card.Link>
                    </FormCheck.Label>
                  </FormCheck>

                  <Button variant="primary" type="submit" className="w-100">
                    Sign up
                  </Button>
                </Form>

                <div className="mt-3 mb-4 text-center">
                  <span className="fw-normal">or</span>
                </div>
                <div className="d-flex justify-content-center my-4">
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-facebook me-2">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-twitter me-2">
                    <FontAwesomeIcon icon={faTwitter} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pil text-dark">
                    <FontAwesomeIcon icon={faGithub} />
                  </Button>
                </div>

                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal text-black">
                    Already have an account?
                    <Card.Link as={Link} to={Routes.Signin.path} className="fw-bold">
                      {` Login here `}
                    </Card.Link>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
 }
};
