import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../component/Header";
import { useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";

const ImportData = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [file, setFile] = useState();
  const [columns, setColumns] = useState([]);
    const fileReader = new FileReader();

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
    };

    const [csvArray, setCsvArray] = useState([]);

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

        if (file) {
            fileReader.onload = function (event) {
                const csvOutput = event.target.result;
                console.log(csvOutput);
                processCSV(csvOutput);
            };

            fileReader.readAsText(file);
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
              <input
                    type={"file"}
                    id={"csvFileInput"}
                    accept={".csv"}
                    onChange={handleOnChange}
                />
              
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
        />
    </Box>
    </>
  );
};
export default ImportData;
