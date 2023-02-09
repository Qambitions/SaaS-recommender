import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../component/Header";
import { useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import LinkIcon from '@mui/icons-material/Link';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Routes } from "../routes";
import {  Form, Card, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from "react-router-dom";

const SetStrategy = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [config, setConfig] = useState({
    XPath: "",
    strategy: ""
  });
    const handleChange = (e) => {
        // setConfig(e.target.value);
        const name = e.target.name;
        const value = e.target.value;
        setConfig((prevstate) => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
          });
    };

    
    const handleFormSubmit = (e) => {
        e.preventDefault();

        
    };

    

  return (
    <>
    <Box m="20px">
      <Header title="SET STRATEGY" subtitle="" />
    </Box>
    <Box m="0 20px 0 20px">
    <Form
            className="mt-4"
            onSubmit={(e) =>handleFormSubmit(e)}
            >
            <Form.Group id="xpath" className="mb-4">
                <Form.Label>XPath</Form.Label>
                <InputGroup>
                <InputGroup.Text>
                    <LinkIcon/>
                </InputGroup.Text>
                <Form.Control
                    autoFocus
                    required
                    type="text"
                    placeholder="example@company.com"
                    name="XPath"
                    value={config.XPath}
                    onChange={handleChange}
                />
                </InputGroup>
            </Form.Group>

            <Form.Group>
                <Form.Group id="strategy" className="mb-4">
                <Form.Label>Strategy</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                    <ChatBubbleOutlineIcon/>
                    </InputGroup.Text>
                    <Form.Control
                    required
                    type="text"
                    placeholder="Strategy"
                    name="strategy"
                    value={config.strategy}
                    onChange={handleChange}
                    />
                </InputGroup>
                </Form.Group>
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
    
    </>
  );
};
export default SetStrategy;
