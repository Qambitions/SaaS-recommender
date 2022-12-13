import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Table,
  Card,
  Button,
  Pagination,
  ButtonGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import { useTable, useSortBy, usePagination } from "react-table";

export default ({ columns, data, isViewDetail = false, handleViewDetail, isClick = false, clickTitle, handleClick }) => {
  const selections = [10, 20, 50, 100];
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    useSortBy,
    usePagination
  );
  const indexItems = [];
  const totalPages = Math.ceil(data.length / pageSize);
  const range = 3;

  for (let number = 0; number < totalPages; number++) {
    const isItemActive = pageIndex === number;

    if (number == pageIndex - range - 1) {
      indexItems.push(
        <Pagination.Ellipsis onClick={() => gotoPage(number)}/>
      );
    } else if (number == pageIndex + range + 1) {
      indexItems.push(
        <Pagination.Ellipsis onClick={() => gotoPage(number)}/>
      );
    } else if (number >= pageIndex - range && number <= pageIndex + range) {
      indexItems.push(
        <Pagination.Item
          active={isItemActive}
          key={number}
          onClick={() => gotoPage(number)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }
  }

  const onClickRow = (index, row) => {
    if (index === 0) {
      if (isViewDetail) handleViewDetail(row);
    }
  };

  return (
    <>
      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Body>
              <Table {...getTableProps()} striped bordered hover responsive>
                <thead className="thead-light">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="border-0"
                        >
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell, index) => {
                          return (
                            <td
                              className="border-0 fw-bold"
                              {...cell.getCellProps()}
                              style={{
                                cursor: index === 0 ? "pointer" : "mouse",
                              }}
                              onClick={() => onClickRow(index, row.values)}
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                        {isClick ? 
                          <td
                            className="border-0 fw-bold"
                          >
                            <Button
                              variant="primary"
                              onClick={() => handleClick(row.cells[0].value)}
                            >{clickTitle}</Button>
                          </td> : <></>
                        }
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={3} className="mb-4">
          <Dropdown
            as={ButtonGroup}
            onSelect={(e) => setPageSize(Number(e))}
            className="m-1"
          >
            <Button variant="light">{`Afficher ${pageSize} objets`}</Button>
            <Dropdown.Toggle split variant="light">
              <FontAwesomeIcon icon={faAngleDown} className="dropdown-arrow" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {selections.map((type, index) => (
                <Dropdown.Item key={index} eventKey={type}>
                  {type}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={9} className="mb-4">
          <Pagination size="md" className="mt-3">
            <Pagination.Prev
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              {"Précédent"}
            </Pagination.Prev>
            {indexItems}
            <Pagination.Next onClick={() => nextPage()} disabled={!canNextPage}>
              {"Suivant"}
            </Pagination.Next>
          </Pagination>
        </Col>
      </Row>
    </>
  );
};
