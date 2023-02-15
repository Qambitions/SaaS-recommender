import React, { useEffect, useState} from "react";
import { Box, Button, IconButton, Typography, useTheme, Select, MenuItem } from "@mui/material";
import {  Form, InputGroup } from '@themesberg/react-bootstrap';
import { tokens } from "../theme";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MouseIcon from '@mui/icons-material/Mouse';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Header from "../component/Header";
// import LineChart from "../../components/LineChart";
// import GeographyChart from "../../components/GeographyChart";
// import BarChart from "../../components/BarChart";
import StatBox from "../component/StatBox";
import ProgressCircle from "../component/ProgressCircle";
import { domainPath } from "../constants/utils";


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const username = localStorage.getItem('userName');
  // const [query, setQuery] = useState({
  //   username: username,
  //   time: "year"
  // });

  const [time, setTime] = useState("year");
  const [products, setProducts] = useState([]);



  const [keys, setKeys] = useState([{
    event_type: "",
    counts: ""
  }])

  const changeFormat = (data) => {
    var result = [];
    var icon = [<AddShoppingCartIcon />, <MouseIcon/>, <ShoppingCartCheckoutIcon/>, <RemoveRedEyeIcon/> ]
    for(var i=0;i<data.counts.length;i++)
            {
                result[result.length] = { 
                    "event_type": data.event_type[i], 
                    "counts": data.counts[i].toLocaleString(),
                    "icon": icon[i]     
                }; 
            }
            return result;

}



  const fetchKeys = async(time) => {
    const url = domainPath + "dimadb/get-key-metrics/?time="+time+
                        "&username="+username;
      const result = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // params: JSON.stringify(query),
        }).then((res) => res.json())
        .then((data) => {
          // setClicks(data.message.toLocaleString());
          setKeys(changeFormat(data.message));
          console.log("Message", changeFormat(data.message));
          return data;
        }).catch((err) => alert("Error in dashboard"));

  }

  const fetchProducts = async(time) => {
    const url = domainPath + "dimadb/get-hot-items/?username="+username;
      const result = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // params: JSON.stringify(query),
        }).then((res) => res.json())
        .then((data) => {
          setProducts(data.message);
          console.log("Products", data.message);
          return data;
        }).catch((err) => alert("Error in dashboard"));

  }

  useEffect(() => {   
    fetchKeys("year").catch(console.error); 
    fetchProducts("year").catch(console.error); 

    }, []);

    const showKeys = () => {
      console.log(keys);
    }
    const handleFilterChange = (e) => {
      setTime(e.target.value);
      fetchKeys(e.target.value);
      
    }

  return (
    <>
    <Box m="20px" >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to dashboard"/>
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={showKeys}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }}/>
            Download Reports
          </Button>
        </Box>
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

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        {keys && keys.map((item, index) =>  
          <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          key={index}
        >
          <StatBox
            title={item.counts}
            subtitle={item.event_type}
            icon = {item.icon}
            // icon={
            //   <EmailIcon
            //     sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            //   />
            // }
          />

        </Box>
        )}

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Revenue Generated
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $59,342.32
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          {/* <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box> */}
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Hot products
            </Typography>
          </Box>
          {products.map((item, i) => (
            <Box
              key={`${item.id}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {item.id}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {item.name}
                </Typography>
              </Box>
              {/* <Box color={colors.grey[100]}>{transaction.date}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                ${transaction.cost}
              </Box> */}
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box> */}
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box> */}
      </Box>
    </Box>
    </>
  );
};

export default Dashboard;
