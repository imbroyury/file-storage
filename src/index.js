import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import {
    Drawer,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AllFiles from './views/AllFiles';
import UploadFile from './views/UploadFile';
import Login from './views/Login';
import Register from './views/Register';

const drawerWidth = '10rem';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  view: {
    marginLeft: drawerWidth,
  },
}));

const routes = {
  preAuth: [
    {
      View: Login,
      path: '/login',
      linkLabel: 'Log in',
    },
    {
      View: Register,
      path: '/register',
      linkLabel: 'Register',
    },
  ],
  auth: [
    {
      View: AllFiles,
      path: '/all-files',
      linkLabel: 'All files',
    },
    {
      View: UploadFile,
      path: '/upload-file',
      linkLabel: 'Upload file',
    },
  ],
};

const Root = () => {
  const classes = useStyles();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const loginUser = () => setIsUserLoggedIn(true);

  return (<Router>
      <Drawer
        variant="permanent"
        anchor="left"
        className={classes.drawer}
        classes={{paper: classes.drawerPaper}}
      >
        <List>
          {
            (isUserLoggedIn ? routes.auth : routes.preAuth).map(route => (
                <ListItem button component={Link} to={route.path} key={route.path}>
                    <ListItemText>{route.linkLabel}</ListItemText>
                </ListItem>
            ))
          }
        </List>
      </Drawer>
      <main className={classes.view}>
        <Switch>
          {
            [...routes.auth, ...routes.preAuth].map(route => (
              <Route path={route.path} key={route.path}>
                  <route.View isUserLoggedIn={isUserLoggedIn} loginUser={loginUser} />
              </Route>
            ))
          }
        </Switch>
      </main>
    </Router>)
}

ReactDOM.render(<Root />, document.getElementById('root'));
