import React, { useEffect, useState} from "react";
import { Box, Button} from "@mui/material";
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
  const [col, setCol] = useState([]);
  const columns = [
    "product_id", "product_name", "counts", "price", "revenue"
  ].map(c => ({
    field: c,
    headerName: c,
    flex: 1,
  }));
  const [clicks, setClicks] = useState([]);

    const handleGetRowId = (e) => {
      return e.product_id;
  }

  const changeFormat = (clicks) => {

    var result = [];
    for(var i=0;i<clicks.product_id.length;i++)
            {
                result[result.length] = { 
                    "product_id": clicks.product_id[i], 
                    "product_name": clicks.product_name[i],
                    "counts": clicks.counts[i],
                    "price": clicks.price[i],
                    "revenue": clicks.revenue[i]           
                }; 

            }
            return result;
    // var result = clicks.map(item=> {
    //   return ( {product_id: item.product_id ,
    //     product_name: item.product_name})
    // }
     
    //   );
    // setClicks(result);
    // console.log("Clicks 2", clicks);

    // console.log("Test: ", result);
}

    // const fetchClicks = () => {
    //   const url = domainPath + "dimadb/get-clicks/?time="+query.time+"&product="+query.product+"&customer_id="+query.customer_id+"&username="+query.username+"&event_type="+query.event_type;
    //   fetch(url, {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       // params: JSON.stringify(query),
    //     }).then((res) => res.json())
    //     .then((data) => {
    //       return data;
    //     }).catch((err) => alert(err));
    //   }; 

    // useEffect(() => {
    //   (async () => {
    //     const data = await fetchClicks();
    //     setClicks(data);
    //   })();
    
    //   return () => {
    //     console.log("Clicks: ", clicks);
    //   };
    // }, []);

  
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
              }).then((res) => res.json())
              .then((data) => {
                setClicks(changeFormat(data.message))
                return data;
              }).catch((err) => alert(err));

              // console.log("Result:  ", changeFormat(result.message));
              // var columnsIn = changeFormat(result.message)[0]; 
              //   for(var key in columnsIn){
              //     setCol(current => [...current, key]);
              //     console.log("Collll", key); // here is your column name you are looking for
              //   } 

              
        }


        fetchClicks().catch(console.error);  
         
        }, []);

  return (
    <>
    <Box m="20px">
      <Header title="CLICK STATISTICS" subtitle="Captured click event on website" />
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
         {clicks ? <DataGrid
          getRowId={handleGetRowId}
          rows={clicks}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        /> : ""}
     

    </Box>
    </>
  );
};
export default ViewClicks;
