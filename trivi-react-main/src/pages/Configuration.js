import React, { useState, useEffect, useContext } from "react";
import {
  Col,
  Row,
  Card,
  Form,
  Container,
  Button,
  Tab,
  Nav,
} from "@themesberg/react-bootstrap";
import ProcessTables from "./tables/ProcessTables";
import { TabTitle } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";

export default () => {
  TabTitle("Configuration");

  const {fetchRequest} = useContext(AppContext);
  const [listItemTypes, setListItemTypes] = useState([]);
  const [itemType, setItemType] = useState("");
  const [webActivityInfo, setWebActivityInfo] = useState({});
  const columns = listItemTypes.length
    ? Object.keys(listItemTypes[0]).filter((key) => {
      return key !== 'value'
    }).map((key) => {
        return { Header: key, accessor: key };
      })
    : [];

  useEffect(() => {
    fetchRequest(`dimadb/get-configure-info/`, 'GET')
    .then((data) => {
      if (data != undefined) {
        setListItemTypes(data.similarTrainInfo);
        setWebActivityInfo(data.webActivityInfo);
      }
    }).catch((err) => alert(err));
  }, []);

  const handleSubmitMostPopular = (e) => {
    e.preventDefault();

    fetchRequest(`dimadb/update-activity-weight/`, 'POST', 
    JSON.stringify({
      webActivityInfo: webActivityInfo,
    })).then((data) => {
      if (data != undefined)
        alert(`Mise à jour des pondérations terminée`);
    }).catch((err) => alert(err));
  };

  const handleSubmitSimilar = (e) => {
    e.preventDefault();

    fetchRequest(`dimadb/train-similar-recommend/`, 'POST', 
    JSON.stringify({
      itemType: itemType,
    })).then((data) => {
      if (data != undefined) {
        setListItemTypes(data.similarTrainInfo)
        alert(`Formation algorithmique terminée`);
      }
    }).catch((err) => alert(err));
  };

  const setActivityWeight = (key, value) => {
      var newWebActivityInfo = JSON.parse(JSON.stringify(webActivityInfo))
      newWebActivityInfo[key] = value
      setWebActivityInfo(newWebActivityInfo)
  }

  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-4 mb-md-0">
            <h1 className="h2">Configuration</h1>
          </Col>
        </Row>
        <Row className="d-flex flex-wrap flex-md-nowrap justify-content-center align-items-center py-4">
          <Col xs={12} className="d-block mb-4 mb-md-0">
            <Card>
              <Card.Body>
                <Tab.Container defaultActiveKey="home">
                  <Nav fill variant="pills" className="flex-column flex-sm-row">
                    <Nav.Item>
                      <Nav.Link eventKey="home" className="mb-sm-3 mb-md-0">
                       Produits les plus populaires
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="messages" className="mb-sm-3 mb-md-0">
                       Produits similaires
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="home" className="py-4">
                      <Form
                        className="row"
                        onSubmit={(e) => handleSubmitMostPopular(e)}
                      >
                        <Row>
                          {Object.keys(webActivityInfo).map((key, index) => (
                            <Form.Group className="mb-3 col-6" key={index}>
                              <Form.Label>{`${key}`}</Form.Label>
                              <Form.Control
                                type="number"
                                value={webActivityInfo[key]}
                                onChange={(e) => setActivityWeight(key, e.target.value)}
                                min={0}
                                required
                              />
                            </Form.Group>
                          ))}
                        </Row>
                        <Row className="d-flex justify-content-center flex-nowrap">
                          <Button
                            variant="primary"
                            className="m-1"
                            type="submit"
                            style={{ width: 150 }}
                          >
                            Sauvegarder les pondérations
                          </Button>
                        </Row>
                      </Form>
                    </Tab.Pane>
                    <Tab.Pane eventKey="messages" className="py-4">
                      <Form
                        className="row"
                        onSubmit={(e) => handleSubmitSimilar(e)}
                      >
                        <Form.Group className="mb-3 col-6">
                          <Form.Label>Types de produits culturels</Form.Label>
                          <Form.Control
                            as="select"
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value)}
                            required
                          >
                            <option value="">Dérouler ce menu de sélection</option>
                            {listItemTypes.map((item, index) => (
                              <option value={item["value"]} key={index}>
                                {item["name"]}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                        <Row className="d-flex justify-content-center flex-nowrap">
                          <Button
                            variant="primary"
                            className="m-1 mb-5"
                            type="submit"
                            style={{ width: 150 }}
                          >
                            Entraîner
                          </Button>
                        </Row>
                      </Form>
                      <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
                        <Col className="d-block mb-4 mb-md-0">
                          <h1 className="h2">
                            Historique de la formation d'algorithme
                          </h1>
                        </Col>
                      </Row>
                      {columns.length ? (
                        <ProcessTables
                          columns={columns}
                          data={listItemTypes}
                          isDelete={false}
                        />
                      ) : <></>}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </article>
  );
};
