import React, { useEffect, useState} from "react";
import moment from "moment";
import { Box, Button, IconButton, Typography, useTheme, Select, MenuItem } from "@mui/material";
import {  Form, InputGroup } from '@themesberg/react-bootstrap';
import { tokens } from "../theme";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MouseIcon from '@mui/icons-material/Mouse';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FaceIcon from '@mui/icons-material/Face';
import Header from "../component/Header";

import LineChart from "../component/LineChart";

import StatBox from "../component/StatBox";
import ProgressCircle from "../component/ProgressCircle";
import { domainPath } from "../constants/utils";


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const username = localStorage.getItem('userName');

  const [time, setTime] = useState("year");
  const [products, setProducts] = useState([]);

  const [keys, setKeys] = useState([{
    event_type: "",
    counts: ""
  }])



  const changeFormat = (data) => {
    var result = [];
    var icon = [<AddShoppingCartIcon />, <MouseIcon/>, <FaceIcon/>, <ShoppingCartCheckoutIcon/>, <RemoveRedEyeIcon/> ]
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
    await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json())
        .then((data) => {
          if (data.message != 'false')
            setKeys(changeFormat(data.message))
          
        }).catch((err) => console.log(err));

  }

  const fetchProducts = async(time) => {
    const url = domainPath + "dimadb/get-hot-items/?username="+username;
     await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json())
        .then((data) => {
          if (data.message != 'false')
            setProducts(data.message);
          // return data;
        }).catch((err) => console.log(err));
        // alert("Please reload page and wait a second")
  }
  const [diagram, setDiagram] = useState([
    {
      id: "",
      color:"",
      data: [{
        x:"",
        y:""
      }]
    }
  ])

  const [filteredData, setFilteredData] = useState([])

  const changeDiagramFormat = (data, time) => {
    var result = [];
    var colors = [tokens("dark").blueAccent[300], tokens("dark").greenAccent[500], tokens("dark").redAccent[200], tokens("dark").grey[200], tokens("dark").primary[200] ]
    var id = ["Add to cart", "Click","Login", "Remove from cart", "View"]
 

    for(var i=0;i<5;i++)
    {
        var iData = [];
        if (data[id[i]].counts.length!=0){
          for (var j=0; j<data[id[i]].counts.length; j++){
            iData[iData.length] = {
              "x":  moment(data[id[i]].created_at[j]).format("YYYY-MM-DD"),
              "y": data[id[i]].counts[j] , 
            }
          }
          let filteredData = iData;
          if (time != "year") {
            filteredData = iData.filter((item) => {
              const month = new Date(item.x).getMonth();
              return month === time;
            });
          }
          
          result[result.length] = {  
            "id" : id[i],
            "color": colors[i],
            "data": filteredData
        }; 
        }
        
       
    }
      return result;
  }

  const fetchDiagram = async() => {  
    const url = domainPath + "dimadb/get-diagram-data/?username="+username;
    console.log("Time: ", time);
    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
    .then((data) => {
      if (data.message != 'false'){
        setDiagram(data.message)
        setFilteredData(changeDiagramFormat(data.message, time))
      }
    }).catch((err) => console.log(err));

 }

  useEffect(() => {   
    fetchKeys("year"); 
    fetchProducts("year"); 
    fetchDiagram()

    }, []);

    const handleFilterChange = (e) => {
      setTime(e.target.value);
      setFilteredData(changeDiagramFormat(diagram, e.target.value));
      
    }

  return (
    <>
    <Box m="20px" >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to dashboard"/>
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
                  <MenuItem value={0}>January</MenuItem>
                  <MenuItem value={1}>February</MenuItem>
                  <MenuItem value={2}>March</MenuItem>
                  <MenuItem value={3}>April</MenuItem>
                  <MenuItem value={4}>May</MenuItem>
                  <MenuItem value={5}>June</MenuItem>
                  <MenuItem value={6}>July</MenuItem>
                  <MenuItem value={7}>August</MenuItem>
                  <MenuItem value={8}>September</MenuItem>
                  <MenuItem value={9}>October</MenuItem>
                  <MenuItem value={10}>November</MenuItem>
                  <MenuItem value={11}>December</MenuItem>
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
         
        {keys && keys.map((item, index) => <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          m="10px"
        >
          <StatBox
          title={item.counts}
          subtitle={item.event_type}
          icon = {item.icon}
          key={index}
        /> 
        </Box>
        )}
        

        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
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
                Captured event statistic
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={false} diagram={filteredData}/>
          </Box>
        </Box>
        <Box
          gridColumn="span 12"
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
          {products && products.map((item, i) => (
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
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}
        {/* <Box
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
        </Box> */}
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
