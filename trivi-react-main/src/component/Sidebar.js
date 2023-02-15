import React, { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useHistory } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import UploadIcon from '@mui/icons-material/Upload';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutIcon from '@mui/icons-material/Logout';
import MouseIcon from '@mui/icons-material/Mouse';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Button } from "@mui/material";
import { Routes } from "../routes";


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => {
        setSelected(title);
        localStorage.setItem('selectedScreen',title);
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState(localStorage.getItem('selectedScreen') || 'Dashboard');
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    history.push("/sign-in");
  };

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  RECOMMENDER
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src="https://picsum.photos/200"
                  // src={`url(${profileImage})`} 
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />

              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Khoa Bui
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Admin
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to={Routes.Dashboard.path}
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Configuration
            </Typography>

            <Item
              title="Configuration"
              to={Routes.Config.path}
              icon={<DisplaySettingsIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              General data
            </Typography>

            <Item
              title="Import data"
              to={Routes.Import.path}
              icon={<UploadIcon />}
              selected={selected}
              setSelected={setSelected}
            />
         
          <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Captured data
            </Typography>

            <Item
              title="Clicks"
              to={Routes.ViewClicks.path}
              icon={<MouseIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Add to cart"
              to={Routes.ViewAddToCart.path}
              icon={<AddShoppingCartIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Remove from cart"
              to={Routes.ViewRemoveCart.path}
              icon={<ShoppingCartCheckoutIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="View"
              to={Routes.View.path}
              icon={<RemoveRedEyeIcon />}
              selected={selected}
              setSelected={setSelected}
            />

           

          {isCollapsed ? 
          <>
          <LogoutIcon 
          sx = {{m: "15px 0 5px 30px"}}
          color={colors.grey[300]}
          onClick={handleLogout}/>
          </> : 
          <>
             <Button
             sx={{
               backgroundColor: colors.blueAccent[700],
               color: colors.grey[100],
               fontSize: "14px",
               fontWeight: "bold",
               padding: "10px 20px",
               m: "15px 0 5px 20px",
               
             }}        onClick={handleLogout}
             
 
           >
             <LogoutIcon sx={{ mr: "10px" }}/>
              Logout
           </Button>
           </>}

          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
