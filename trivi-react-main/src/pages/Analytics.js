import React, { useEffect, useState, useContext } from "react";
import { Row, Container, Form, Button } from "@themesberg/react-bootstrap";
import Chart from "./components/Chart";
import { TabTitle } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";

export default () => {
  TabTitle("Analyse des données");

  const listGroupTypes = [
    {
      "name": "Rapport quotient",
      "value": "daily"
    },
    {
      "name": "Rapport hebdomadaire",
      "value": "weekly"
    },
    {
      "name": "Rapport mensuel",
      "value": "monthly"
    },
    {
      "name": "Rapport annuel",
      "value": "yearly"
    },
    {
      "name": "Rapport de synthèse",
      "value": "none"
    },
  ]
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);
  const {fetchRequest} = useContext(AppContext);
  const [startDate, setStartDate] = useState(fromDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(toDate.toISOString().split('T')[0]);
  const [groupType, setGroupType] = useState('daily');
  const [charts, setCharts] = useState([]);

  const getQueryParams = () => {
    return `startDate=${startDate}&endDate=${endDate}&groupBy=${groupType}`
  }

  useEffect(() => {
    fetchRequest(`dimadb/get-reports/?${getQueryParams()}`, 'GET')
    .then((data) => {
      if (data != undefined)
        setCharts(data.reports);
    }).catch((err) => alert(err));
  }, []);

  const handleSubmitForm = (e) => {
    e.preventDefault();

    fetchRequest(`dimadb/get-reports/?${getQueryParams()}`, 'GET')
    .then((data) => {
      if (data != undefined)
        setCharts(data.reports);
    }).catch((err) => alert(err));
  }

  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Form className='row' onSubmit={(e) => handleSubmitForm(e)}>
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
            <Form.Group className="mb-3 col-6">
              <Form.Label>Types de rapports</Form.Label>
              <Form.Control
                as="select"
                value={groupType}
                onChange={(e) => {
                  setGroupType(e.target.value);
                }}
                required
              >
                {listGroupTypes.map((item, index) => (
                  <option value={item.value} key={index}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Row className="d-flex justify-content-center flex-nowrap">
              <Button
                variant="primary"
                className="m-1 mb-3"
                type="submit"
                style={{ width: 200 }}
              >
                Générer un rapport
              </Button>
            </Row>
          </Form>
        </Row>
        <Row className="mt-3">
          {charts.map((chart, index) => (
            <Chart key={chart.random} rawChart={chart} />
          ))}
        </Row>
      </Container>
    </article>
  );
};
