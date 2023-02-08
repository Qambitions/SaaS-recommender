import React, { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../component/Header";
import { useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import { domainPath } from "../constants/utils";


    
const ViewClicks = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const username = localStorage.getItem('userName');
  const [query, setQuery] = useState({
    username: username,
    event_type: "Click",
    product: "",
    customer_id: "",
    time: "year"
  });
  const [data, setData] = useState([]);


    

    // const fetchClicks = (e, query) => {
    //     e.preventDefault();
    //     fetch(domainPath + "dimadb/get-clicks/", {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       params: JSON.stringify(query),
    //     })
    //       .then((res) => {

    //         console.log(res);
    //       })
    //       .catch((err) => alert(err));
    //   };
      useEffect(() => {
        const url = domainPath + "dimadb/get-clicks/?time="+query.time+"&product="+query.product+"&customer_id="+query.customer_id+"&username="+query.username+"&event_type="+query.event_type;
        console.log("url: ", url);
        const fetchClicks = async() => {
            const result = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                // params: JSON.stringify(query),
              }).then((res) => {
                  console.log(res);
                }).catch((err) => alert(err));
            console.log("Result:  ", result);

                setData(result.message);
        }

        fetchClicks().catch(console.error);
        }, []);
  return (
    <>
    <Box m="20px">
      <Header title="CLICK STATISTICS" subtitle="Import a CSV file" />
    </Box>
    <Box
        width="75vw"
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
        {/* <DataGrid
          rows={csvArray}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        /> */}
    </Box>
    </>
  );
};
export default ViewClicks;
