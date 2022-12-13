import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Container,
  Button,
  Form,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { useHistory, useLocation } from "react-router";
import { CSVLink } from "react-csv";
import ProcessTables from "./tables/ProcessTables";
import { TabTitle, capitalize } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";
import { itemTypeFrench } from "../constants/utils";

export default () => {
  const {fetchRequest} = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const itemType = location.pathname.split("/").slice(-1)[0];
  const [isViewDetail, setIsViewDetail] = useState(false);
  const [items, setItems] = useState([]);
  const [searchItems, setSearchItems] = useState([]);
  const headerKeys = searchItems.length
    ? Object.keys(searchItems[0]).map((key) => {
        return { label: key, key: key };
      })
    : [];
  const columns = searchItems.length
    ? Object.keys(searchItems[0]).filter(v => v !== 'id').map((key) => {
        return { Header: key, accessor: key };
      })
    : [];

  TabTitle('Liste des ' + itemTypeFrench[itemType] + 's');

  useEffect(() => {
    fetchRequest(`dimadb/list-item/${itemType}/`, 'GET')
    .then((data) => {
      if (data != undefined) {
        setAllItems(data.items);
        setIsViewDetail(data.isViewDetail);
      }
    }).catch((err) => alert(err));
  }, []);

  const setAllItems = (json, level = 2) => {
    if (level >= 2) setItems(json);
    if (level >= 1) setSearchItems(json);
  };

  const handleViewDetail = (row) => {
    const item_id_name = Object.keys(row)[0];
    const item_id = row[item_id_name];
    const id = searchItems.filter(item => item[item_id_name] == item_id)[0]['id'];
    const url = `/data-management/detail/${itemType}/${id}`
    history.push(url);
  };

  const handleImportFile = (e) => {
    const url = `/data-management/import-file/${itemType}`;
    history.push(url);
  };

  const handleImportAPI = (e) => {
    const url = `/data-management/import-api/${itemType}`;
    history.push(url);
  };

  const handleImportHistory = (e) => {
    const url = `/data-management/import-history/${itemType}`;
    history.push(url);
  };

  const handleNewItem = () => {
    const url = `/data-management/detail/${itemType}/form`;
    history.push(url);
  };

  const handleSynchronizeGA = () => {
    const url = `/data-management/synchronize-google-analytic`;
    history.push(url);
  }

  const handleImportGA = () => {
    const url = `/data-management/list/google-analytic-report`;
    history.push(url);
  }

  const searchKeyWord = (keyword) => {
    if (keyword === "") {
      setAllItems(items, 2);
    } else {
      var filteredKeyWord = [];
      for (var i = 0; i < items.length; i++) {
        const obj = items[i];
        const keys = Object.keys(obj);
        for (var j = 0; j < keys.length; j++) {
          const value = String(obj[keys[j]]).toLowerCase();
          if (value.includes(keyword.toLowerCase())) {
            filteredKeyWord.push(obj);
            break;
          }
        }
      }
      setAllItems(filteredKeyWord, 1);
    }
  };

  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-4 mb-md-0">
            <h1 className="h2">Liste des {itemTypeFrench[itemType]}s</h1>
          </Col>
          <Col xs={3} className="mb-4">
            <Form.Group>
              <InputGroup className="input-group-merge">
                <Form.Control
                  type="text"
                  placeholder="Recherche de mots clés"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      searchKeyWord(e.target.value);
                    }
                  }}
                />
                <InputGroup.Text>
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ cursor: "pointer" }}
                  />
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="mb-4">
            {isViewDetail ? (
              <Button
                variant="primary"
                className="m-1"
                onClick={() => handleNewItem()}
              >
                Créer un(e) {itemTypeFrench[itemType]}
              </Button>
            ) : (
              <></>
            )}
            {
              itemType !== 'google-analytic-report' ? (
                <Button
                  variant="secondary"
                  className="m-1"
                  onClick={() => handleImportFile()}
                >
                  Importer un fichier
                </Button>
              ) : (<></>
              )
            }
            {
              itemType !== 'google-analytic-report' ? (
                <Button
                  variant="warning"
                  className="m-1"
                  onClick={() => handleImportAPI()}
                >
                  Importer via API
                </Button>
              ) : (
                <></>
              )
            }
            {
              itemType == 'web-activity' ? (
                <Button
                  variant="primary"
                  className="m-1"
                  onClick={() => handleImportGA()}
                >
                  Importer de GA
                </Button>
              ) : (
                <></>
              )
            }
            {
              itemType == 'google-analytic-report' ? (
                <Button
                  variant="warning"
                  className="m-1"
                  onClick={() => handleSynchronizeGA()}
                >
                  Synchroniser GA
                </Button>
              ) : (
                <></>
              )
            }
            <Button variant="tertiary" className="m-1">
              <CSVLink data={searchItems} headers={headerKeys}>
              Exporter un fichier
              </CSVLink>
            </Button>
            <Button
              variant="danger"
              className="m-1"
              onClick={() => handleImportHistory()}
            >
              Supprimer un fichier
            </Button>
          </Col>
        </Row>
        {columns.length > 0 ? (
          <ProcessTables
            columns={columns}
            data={searchItems}
            isViewDetail={isViewDetail}
            handleViewDetail={handleViewDetail}
          />
        ) : (
          <></>
        )}
      </Container>
    </article>
  );
};
