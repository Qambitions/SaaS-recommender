import React, { useEffect, useState} from "react";
import Header from "./Header";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import { domainPath } from "../constants/utils";
import { Box, useTheme, Select, MenuItem } from "@mui/material";
import {  Form, InputGroup } from '@themesberg/react-bootstrap';


const ViewTemplate = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const username = localStorage.getItem('userName') || 'Unknown';
  const [query, setQuery] = useState({
    username: username,
    event_type: props.event_type,
    time: "year"
  });

  const handleFilterChange = (e) => {
    setTime(e.target.value);
    
  }
  const [time, setTime] = useState("year");
  
  const columns = [
    { field: 'product_id', headerName: 'product_id', width: 150 },
    {
      field: 'product_name',
      headerName: 'product_name',
      width: 500,
    },
    {
      field: 'counts',
      headerName: 'counts',
      width: 150,
    },
    {
      field: 'price',
      headerName: 'price',
      width: 150,
    },
  ];

  
  const [data, setData] = useState([]);

    const handleGetRowId = (e) => {
      return e.product_id;
  }

  const changeFormat = (data) => {
    var result = [];
    for(var i=0;i<data.product_id.length;i++)
            {
                result[result.length] = { 
                    "product_id": data.product_id[i], 
                    "product_name": data.product_name[i],
                    "counts": data.counts[i],
                    "price": data.price[i].toLocaleString(),      
                }; 
            }
            return result;

}

      useEffect(() => {
        const url = domainPath + "dimadb/get-clicks/?time="+query.time+
                              "&username="+query.username+
                              "&event_type="+query.event_type;
        const fetchData = async() => {
            const result = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                // params: JSON.stringify(query),
              }).then((res) => res.json())
              .then((data) => {
                setData(changeFormat(data.message))
                
                return data;
              }).catch((err) => alert("Please reload page and wait a second"));

        }
        fetchData().catch(console.error);  
         
        }, []);

  return (
    <>
    <Box m="20px">
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Header title="CLICK STATISTICS" subtitle="Captured click event on website" />
      <Box>
        <Form.Group id="time" className="mb-4">
            <Form.Label>Filter by time: </Form.Label>
            <InputGroup>
                 <Select
                  name="time"
                  value={time}
                  label="Time"
                  onChange={handleFilterChange}
                  required
                  type="text"
                  fullWidth
                  
                >
                  <MenuItem value={"year"} >Year</MenuItem>
                  <MenuItem value={"month"}>Month</MenuItem>
                  <MenuItem value={"week"}>Week</MenuItem>

                </Select>
            </InputGroup>
            </Form.Group>    
        </Box>
        </Box>
    </Box>
    <Box
        width="75vw"
        height="80vh"
        ml="20px"
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
         {data ? <DataGrid
          getRowId={handleGetRowId}
          rows={data}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        /> : ""}
     

    </Box>
    </>
  );
};
export default ViewTemplate;
