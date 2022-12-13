import React, { useState, useEffect, useContext, useRef } from "react";
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
  const refFile = useRef(null);
  const {fetchRequest} = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [listTemplates, setListTemplates] = useState([]);
  const [template, setTemplate] = useState([]);
  const [inputFile, setInputFile] = useState(null);
  const urlArrays = location.pathname.split("/");
  const itemType = urlArrays[urlArrays.length - 1];

  TabTitle(`Importer un fichier - ${itemTypeFrench[itemType]}`);

  useEffect(() => {
    fetchRequest(`dimadb/get-mapping-templates/${itemType}/`, 'GET')
    .then((data) => {
      if (data != undefined)
        setListTemplates(data.listTemplates);
    }).catch((err) => alert(err));
  }, []);

  const handleOpenModal = (e) => {
    e.preventDefault();

    if (inputFile)
        setShowModal(true);
  };

  const handleCloseModal = () => {setShowModal(false)};

  const onChangeFile = (e) => {
      setInputFile(e.target.files[0]);
  }

  const handleChooseFile = () => {
    refFile.current.click();
  }

  const handleImportFile = (e) => {
    e.stopPropagation();
    e.preventDefault();

    let data = new FormData();
    data.append("files[]", inputFile);
    data.append("template", template);

    fetchRequest(`dimadb/import-file/${itemType}/`, 'POST', data, false)
    .then((result) => {
      if (result != undefined) {
        alert(result.message);
        history.go(0);
      }
    }).catch((err) => alert(err));
  };

  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center pt-3">
          <Col className="d-block mb-2 mb-md-0">
            <h1 className="h2">Importer un fichier - {itemTypeFrench[itemType]}</h1>
          </Col>
        </Row>
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-3">
          <Col xs={12} className="mb-4">
          <Form className="row" onSubmit={(e) => handleOpenModal(e)}>
                <Form.Group className="mb-3 col-6">
                    <Form.Label>Télécharger un fichier</Form.Label>
                    <Form.Control 
                        type="text"
                        value={inputFile ? inputFile.name : "Choisir un fichier de json (extension de fichier .json)"}
                        onClick={() => handleChooseFile()}
                        readOnly
                    />
                    <input
                        type="file"
                        accept="application/JSON"
                        id="file"
                        ref={refFile}
                        style={{ display: "none" }}
                        onChange={(e) => onChangeFile(e)}
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
                        placeholder="A"
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
                            <Modal.Title className="h6">Import</Modal.Title>
                            <Button
                                variant="close"
                                aria-label="Close"
                                onClick={handleCloseModal}
                            />
                            </Modal.Header>
                            <Modal.Body>
                            <p>Veuillez-vous importer ce fichier?</p>
                            </Modal.Body>
                            <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={(e) => {
                                handleCloseModal();
                                handleImportFile(e);
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
