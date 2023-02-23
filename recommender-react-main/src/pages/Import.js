import React, { useState } from "react";
import { Box, Button, TextField, Select, MenuItem, FormHelperText  } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../component/Header";
import { useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import {  Form, Card, InputGroup } from '@themesberg/react-bootstrap';
import { domainPath } from "../constants/utils";


const ImportData = () => {
  const username = localStorage.getItem('userName') || 'Unknown';
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [file, setFile] = useState();
  const [columns, setColumns] = useState([]);
  const [csvArray, setCsvArray] = useState([]);

  const [table, setTable] = useState("");
  const [error, setError] = useState(false);
  const [fileMissing, setFileMissing] = useState(false);

  const fileReader = new FileReader();

  const handleFileChange = (e) => {
      setFile(e.target.files[0]);
  };
  const handleTabChange = (e) => {
    setTable(e.target.value);
};
  const handleGetRowId = (e) => {
    return table=="PRODUCT" ? e.product_id : e.customer_id;
  }


  const processCSV = (str, delim=',') => {
    
      const headers = str.slice(0,str.indexOf('\n')).split(delim);
      const rows = str.slice(str.indexOf('\n')+1).split('\n');

      const newArray = rows.map( row => {
          const values = row.split(delim);
          const eachObject = headers.reduce((obj, header, i) => {
              obj[header] = values[i];
              return obj;
          }, {})
          return eachObject;
      })

      
      setCsvArray(newArray);
      const columns = headers.map(c => ({
        field: c,
        headerName: c,
        flex: 1,
      }));

      setColumns(columns);


  }

  const handleFormSubmit = (e) => {
      e.preventDefault();

      if (table=="")
      {
        setError(true)
        return;
      }
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("table", table);
        formData.append("username", username);
        fetch(domainPath + "dimadb/import-csv/", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((json) => alert("Import successfully!!"))
          .catch((err) => alert(err));

        // Show on datagrid
          fileReader.onload = function (event) {
              const csvOutput = event.target.result;
              processCSV(csvOutput);
          };

          fileReader.readAsText(file);     
      }
      else {
        setFileMissing(true);
        return;
      }

  };

    

  return (
    <>
    <Box m="20px">
      <Header title="IMPORT DATA" subtitle="Import a CSV file" />
      <form>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <Form.Group id="file" className="mb-4" gridColumn="span 6">
            <Form.Label>Choose file to import</Form.Label>
              <input
                    type={"file"}
                    id={"csvFileInput"}
                    accept={".csv"}
                    onChange={handleFileChange}

                />
                {fileMissing && <FormHelperText>Please select a file!!</FormHelperText>}

              </Form.Group>
              <Form.Group id="table" className="mb-4">
            <Form.Label>Select table</Form.Label>
            <InputGroup>
                <Select
                  name="table"
                  value={table}
                  label="Table"
                  onChange={handleTabChange}
                  required
                  type="text"
                  fullWidth
                >
                  <MenuItem value={"CUSTOMERPROFILE"}>Customer Profile</MenuItem>
                  <MenuItem value={"CUSTOMER"}>Customer</MenuItem>
                  <MenuItem value={"PRODUCT"}>Product</MenuItem>

                </Select>
                {error && <FormHelperText>Please select a table you want to import!!</FormHelperText>}
            </InputGroup>
            </Form.Group>
              
            </Box>
            
            <Box display="flex" justifyContent="end" mt="20px">
              <Button color="secondary" variant="contained"
              onClick={(e) => {
                handleFormSubmit(e);
            }}>
                Import data
              </Button>
            </Box>
          </form>
    </Box>
    <Box
        m="0 20px 0 20px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
        >
        <DataGrid
          rows={csvArray}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={handleGetRowId}        
          />
    </Box>
    </>
  );
};
export default ImportData;
