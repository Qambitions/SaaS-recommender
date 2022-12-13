import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Col,
  Row,
  Form,
  Container,
  Button,
  Modal,
} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router";
import { TabTitle } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";


export default () => {  
  const refFile = useRef(null);
  const {fetchRequest} = useContext(AppContext);
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('2021-01-01');
  const [endDate, setEndDate] = useState((new Date()).toISOString().split('T')[0]);
  const [inputFile, setInputFile] = useState(null);
  const [inputFileName, setInputFileName] = useState('');
  const [listGAVersions, setListGAVersions] = useState([]);
  const [gaVersion, setGAVersion] = useState('');
  const [viewID, setViewID] = useState('');

  TabTitle(`Synchroniser des données Google Analytics`);

  useEffect(() => {
    fetchRequest(`dimadb/get-synchronize-end-date/`, 'GET')
    .then((data) => {
      if (data !== undefined) {
        setStartDate(data.endDate);
        setListGAVersions(data.listGAVersions);
        setGAVersion(data.gaVersion);
        setViewID(data.gaViewID);
        setInputFileName(data.gaJSONKeyFile);
      }
    }).catch((err) => alert(err));
  }, []);

  const handleOpenModal = (e) => {
    e.preventDefault();

    if (inputFileName)
        setShowModal(true);
    else {
      alert("Add json key file")
    }
  };

  const handleCloseModal = () => {setShowModal(false)};

  const onChangeFile = (e) => {
    setInputFile(e.target.files[0]);
    setInputFileName(e.target.files[0].name);
  }

  const handleChooseFile = () => {
    refFile.current.click();
  }

  const handleSynchronizeGA = (e) => {
    if (startDate < endDate) {
        let data = new FormData();
        data.append("files[]", inputFile);
        data.append("jsonKeyFileName", inputFileName);
        data.append("gaVersion", gaVersion);
        data.append("viewID", viewID);
        data.append("startDate", startDate);
        data.append("endDate", endDate);
        
        fetchRequest(`dimadb/synchronize-google-analytic/`, 'POST', data, false)
        .then((data) => {
            if (data !== undefined) {
                alert("Synchronisation des données Google Analytics terminée")
            }
          history.go(0);
        }).catch((err) => alert(err));
    } else {
        alert("La date de fin doit être postérieure à la date de début")
    }
  };

  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center pt-3">
          <Col className="d-block mb-2 mb-md-0">
            <h1 className="h2">Synchroniser des données Google Analytics</h1>
          </Col>
        </Row>
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-3">
          <Col xs={12} className="mb-4">
          <Form className="row" onSubmit={(e) => handleOpenModal(e)}>
                {
                    listGAVersions.length ? 
                    <Form.Group className="mb-3 col-6">
                        <Form.Label>Version de Google Analytics</Form.Label>
                        <Form.Control
                        as="select"
                        value={gaVersion}
                        onChange={(e) => setGAVersion(e.target.value)}
                        required
                        >
                        <option value="">Dérouler ce menu de sélection</option>
                        {listGAVersions.map((item, index) => (
                            <option value={item.value} key={index}>
                                {item.name}
                            </option>
                        ))}
                        </Form.Control>
                    </Form.Group>  : <></>
                }
                <Form.Group className="mb-3 col-6">
                    <Form.Label>ID de la vue ou de propriété</Form.Label>
                    <Form.Control
                        type="text"
                        value={viewID}
                        onChange={(e) => {
                        setViewID(e.target.value);
                        }}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3 col-6">
                    <Form.Label>Télécharger le fichier de clé JSON</Form.Label>
                    <Form.Control 
                        type="text"
                        value={inputFileName ? inputFileName : "Choisir un fichier de json (extension de fichier .json)"}
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
                <Form.Group className="mb-3 col-6"></Form.Group>
                <Form.Group className="mb-3 col-6">
                    <Form.Label>Date de début</Form.Label>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                        setStartDate(e.target.value);
                        }}
                        max={endDate}
                    />
                </Form.Group>
                <Form.Group className="mb-3 col-6">
                    <Form.Label>Date de fin</Form.Label>
                    <Form.Control type="date" 
                        value={endDate}
                        onChange={(e) => {
                        setEndDate(e.target.value);
                        }}
                        min={startDate}/>
                </Form.Group>
                <div className="row">   
                    <div className="col text-center">
                        <React.Fragment>
                        <Button variant="primary" className="m-1" type="submit">
                            Synchroniser
                        </Button>
                        <Modal
                            as={Modal.Dialog}
                            centered
                            show={showModal}
                            onHide={handleCloseModal}
                        >
                            <Modal.Header>
                            <Modal.Title className="h6">Synchroniser</Modal.Title>
                            <Button
                                variant="close"
                                aria-label="Close"
                                onClick={handleCloseModal}
                            />
                            </Modal.Header>
                            <Modal.Body>
                            <p>Veuillez-vous synchroniser des données avec Google Analytics ?</p>
                            </Modal.Body>
                            <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={(e) => {
                                handleCloseModal();
                                handleSynchronizeGA(e);
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
