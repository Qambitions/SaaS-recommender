import React, { useState } from "react";
import { Box, Button, TextField, InputLabel, Select, MenuItem } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../component/Header";
import { useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import {  Form, Card, InputGroup } from '@themesberg/react-bootstrap';
import { domainPath } from "../constants/utils";


import { Link } from "react-router-dom";

const Config = () => {
  const username = localStorage.getItem('userName') || 'Unknown';
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [strategy, setStrategy] = useState(
    {
      xpath: "",
      strategy: "",
      url:"",
      event_type: ""
    }
  
);
  const [scheduler, setScheduler] = useState(
    {
      cycle_time: "",
      strategy: ""
    }
  );

    const resetStrategy = () => {
      setStrategy({
        xpath: "",
        strategy: "",
        url:"",
        event_type: ""
      })

    }

    const resetScheduler = () => {
      setScheduler({
        cycle_time: "",
        strategy: ""
      })

    }

    const handleStrategyChange = (e) => {

        const name = e.target.name;
        const value = e.target.value;
        setStrategy((prevstate) => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
          });

        
    };

    const handleSchedulerChange = (e) => {
      const name = e.target.name;
      const value = e.target.value;
      setScheduler((prevstate) => {
          const newState = { ...prevstate };
          newState[name] = value;
          return newState;
        });

  };

    
    const handleStrategySubmit = (e, data) => {
      e.preventDefault();
      fetch(domainPath + "dimadb/add-recommender-strategy/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"strategies":[data], "username":username}),
      })
        .then((res) => res.json())
        .then((json) => {
          alert(json, " Config successfully!");
          resetStrategy();
        })
        .catch((err) => alert(err));   
    };

    const handleSchedulerSubmit = (e, data) => {
      e.preventDefault();
      fetch(domainPath + "dimadb/add-scheduler/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"scheduler":[data], "username":username}),
      })
        .then((res) => res.json())
        .then((json) => {
          alert(json, " Config successfully!");
          resetScheduler();
        })
        .catch((err) => alert(err));  
    };

  return (
    <>
    <Box
     display="grid"
     gridTemplateColumns="repeat(12, 1fr)"
     gridAutoRows="140px"
     gap="20px">
    <Box m="0 20px 0 20px"
    gridColumn="span 5"
    backgroundColor={colors.primary[400]}
    alignItems="center"
    justifyContent="center"
    p="15px">
    <Box m="20px">
      <Header title="SET STRATEGY" subtitle="" />
    </Box>
    <Form
            className="mt-4"
            onSubmit={(e) =>handleStrategySubmit(e, strategy)}
            >
            
            <Form.Group id="strategy" className="mb-4">
            <Form.Label>Strategy</Form.Label>
            <InputGroup>
                <Select
                  name="strategy"
                  value={strategy.strategy}
                  label="Strategy"
                  onChange={handleStrategyChange}
                  required
                  type="text"
                  fullWidth
                >
                  <MenuItem value={"colab"}>Collaborative Filtering</MenuItem>
                  <MenuItem value={"demographic"}>Demographic</MenuItem>
                  <MenuItem value={"hot"}>Hot items</MenuItem>
                  <MenuItem value={"content"}>Content-based</MenuItem>

                </Select>
            </InputGroup>
            </Form.Group>
            <Form.Group id="xpath" className="mb-4">
                <Form.Label>XPath</Form.Label>
                <InputGroup>
                {/* <InputGroup.Text>
                    <LinkIcon/>
                </InputGroup.Text> */}
                <Form.Control
                    autoFocus
                    required
                    type="text"
                    placeholder="XPath"
                    name="xpath"
                    value={strategy.xpath}
                    onChange={handleStrategyChange}
                />
                </InputGroup>
            </Form.Group>

            <Form.Group id="url" className="mb-4">
                <Form.Label>Url</Form.Label>
                <InputGroup>
                <Form.Control
                    autoFocus
                    required
                    type="text"
                    placeholder="url"
                    name="url"
                    value={strategy.url}
                    onChange={handleStrategyChange}
                />
                </InputGroup>
            </Form.Group>
            <Form.Group id="event-type" className="mb-4">
            <Form.Label>Event type</Form.Label>
            <InputGroup>
                {/* <InputGroup.Text>
                <ChatBubbleOutlineIcon/>
                </InputGroup.Text> */}
                <Select
                  name="event_type"
                  value={strategy.event_type}
                  label="Event type"
                  onChange={handleStrategyChange}
                  required
                  type="text"
                  fullWidth
                >
                  <MenuItem value={"Click"}>Click</MenuItem>
                  <MenuItem value={"Log in"}>Log in</MenuItem>
                  <MenuItem value={"View"}>View</MenuItem>
                  <MenuItem value={"Add to cart"}>Add to cart</MenuItem>

                </Select>
            </InputGroup>
            </Form.Group>

            <Button
             sx={{
               backgroundColor: colors.blueAccent[700],
               color: colors.grey[100],
               fontSize: "14px",
               fontWeight: "bold",
               padding: "10px 20px",
               m: "15px 0 5px 20px",
               
             }}        type="submit"
             
 
           >

              Save
           </Button>

            
    </Form>
    </Box>
    <Box
    m="0 20px 0 20px"
    gridColumn="span 5"
    backgroundColor={colors.primary[400]}
    alignItems="center"
    justifyContent="center"
    p="15px">
    <Box m="20px">
      <Header title="SET SCHEDULER" subtitle="" />
    </Box>
    <Form
            className="mt-4"
            onSubmit={(e) =>handleSchedulerSubmit(e, scheduler)}
            >
            <Form.Group id="strategy" className="mb-4">
            <Form.Label>Strategy</Form.Label>
            <InputGroup>
                 <Select
                  name="strategy"
                  value={scheduler.strategy}
                  label="Strategy"
                  onChange={handleSchedulerChange}
                  required
                  type="text"
                  fullWidth
                  
                >
                  <MenuItem value={"colab"} >Collaborative Filtering</MenuItem>
                  <MenuItem value={"demographic"}>Demographic</MenuItem>
                </Select>
            </InputGroup>
            </Form.Group>

            <Form.Group id="time" className="mb-4">
                <Form.Label>Time</Form.Label>
                <InputGroup>
                
                <Select
                  id="time"
                  value={scheduler.cycle_time}
                  label="Time"
                  onChange={handleSchedulerChange}
                  name="cycle_time"
                  fullWidth
                  required
                >
                  <MenuItem value={1}>1 day</MenuItem>
                  <MenuItem value={7}>1 week</MenuItem>
                  <MenuItem value={30}>1 month</MenuItem>
                </Select>
                </InputGroup>
                
            </Form.Group>
            
            
            <Button
             sx={{
               backgroundColor: colors.blueAccent[700],
               color: colors.grey[100],
               fontSize: "14px",
               fontWeight: "bold",
               padding: "10px 20px",
               m: "15px 0 5px 20px",
               
             }}        type="submit"
             
 
           >
              Save
           </Button>          
    </Form>
    </Box>
    </Box>
    </>
  );
};
export default Config;
