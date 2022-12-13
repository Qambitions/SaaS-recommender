import React, { useState, useEffect, useContext } from "react";
import {
  Col,
  Row,
  Form,
  Container,
  Button,
  Modal,
} from "@themesberg/react-bootstrap";
import { useHistory, useLocation } from "react-router";
import { TabTitle } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";
import { itemTypeFrench } from "../constants/utils";


export default () => {  
  const {fetchRequest} = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const urlArrays = location.pathname.split("/");
  const itemType = urlArrays[urlArrays.length - 1];
  const [showModal, setShowModal] = useState(false);
  const [urlAPI, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [listTemplates, setListTemplates] = useState([]);
  const [template, setTemplate] = useState([]);

  TabTitle(`Importer un API - ${itemType}`);

  useEffect(() => {
    fetchRequest(`dimadb/get-mapping-templates/${itemType}/`, 'GET')
    .then((data) => {
      if (data != undefined) 
        setListTemplates(data.listTemplates);
    }).catch((err) => alert(err));
  }, []);

  const handleOpenModal = (e) => {
    e.preventDefault();
    setShowModal(true);

  };

  const handleCloseModal = () => {setShowModal(false)};

  const handleImportAPI = () => {
    fetchRequest(`dimadb/import-api/${itemType}/`, 'POST',
    JSON.stringify({
      itemType: itemType,
      url: urlAPI,
      bearerToken: token,
      template: template
    }))
    .then((data) => {
      if (data != undefined) {
        alert(data.message);
        const newUrl = `/data-management/list/${itemType}`;
        history.push(newUrl);
      }
    }).catch((err) => alert(err));

  };

  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center pt-3">
          <Col className="d-block mb-2 mb-md-0">
            <h1 className="h2">Importer via API - {itemTypeFrench[itemType]}</h1>
          </Col>
        </Row>
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-3">
          <Col xs={12} className="mb-4">
          <Form className="row" onSubmit={(e) => handleOpenModal(e)}>
                <Form.Group className="mb-3 col-6">
                    <Form.Label>URL</Form.Label>
                    <Form.Control
                    type="text"
                    defaultValue={urlAPI}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Ex: https://dici.ca/événements/?page=1"
                    required
                    />
                </Form.Group>
                <Form.Group className="mb-3 col-6">
                    <Form.Label>Bearer Token</Form.Label>
                    <Form.Control
                    type="text"
                    defaultValue={token}
                    placeholder="Ex: trx4rtemn89"
                    onChange={(e) => setToken(e.target.value)}
                    />
                </Form.Group>
                {
                    listTemplates.length ? 
                    <Form.Group className="mb-3 col-6">
                        <Form.Label>Choisir un mapping template</Form.Label>
                        <Form.Control
                        as="select"
                        defaultValue={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        required
                        >
                        <option value="">Dérouler ce menu de sélection</option>
                        {listTemplates.map((item, index) => (
                            <option value={item} key={index}>
                                {item}
                            </option>
                        ))}
                        </Form.Control>
                    </Form.Group>  : <></>
                }
                <div className="row">   
                    <div className="col text-center">
                        <React.Fragment>
                        <Button variant="primary" className="m-1" type="submit">
                            Importer
                        </Button>
                        <Modal
                            as={Modal.Dialog}
                            centered
                            show={showModal}
                            onHide={handleCloseModal}
                        >
                            <Modal.Header>
                            <Modal.Title className="h6">Importer</Modal.Title>
                            <Button
                                variant="close"
                                aria-label="Close"
                                onClick={handleCloseModal}
                            />
                            </Modal.Header>
                            <Modal.Body>
                            <p>Veuillez-vous importer cet API?</p>
                            </Modal.Body>
                            <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={(e) => {
                                handleCloseModal();
                                handleImportAPI(e);
                                }}
                            >
                                Oui
                            </Button>
                            <Button
                                variant="link"
                                className="text-gray ms-auto"
                                onClick={handleCloseModal}
                            >
                                Non
                            </Button>
                            </Modal.Footer>
                        </Modal>
                        </React.Fragment>
                    </div>
                </div>  
              </Form>
          </Col>
        </Row>
      </Container>
    </article>
  );
};
