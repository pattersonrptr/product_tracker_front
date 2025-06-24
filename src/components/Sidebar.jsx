import React from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';

const drawerWidth = 220;
const collapsedWidth = 56;

const Sidebar = ({ open, onWidthChange }) => {
  React.useEffect(() => {
    if (onWidthChange) {
      onWidthChange(open ? drawerWidth : collapsedWidth);
    }
  }, [open, onWidthChange]);

  return (
    <Drawer
      variant="permanent"
      open={open}
      PaperProps={{
        sx: {
          width: open ? drawerWidth : collapsedWidth,
          transition: 'width 0.2s',
          overflowX: 'hidden',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          position: 'fixed',
          left: 0,
          top: 85, // AppBar height
          height: 'calc(100vh - 85px)',
          zIndex: 1200, // under AppBar (zIndex of Drawer is 1200, AppBar is 1100)
        }
      }}
    >
      <Divider />
      <List>
        <ListItem component={Link} to="/products">
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Products" />}
        </ListItem>
        <ListItem component={Link} to="/search-configs">
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Search Configs" />}
        </ListItem>
        <ListItem component={Link} to="/source-websites">
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Source Websites" />}
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
