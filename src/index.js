import React from 'react';
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

const drawerWidth = 180;

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

const routes = [
  {
    View: AllFiles,
    path: '/all-files',
    linkLabel: 'All files',
  },
  {
    View: UploadFile,
    path: '/upload-file',
    linkLabel: 'Upload file',
  }
]

const Root = () => {
  const classes = useStyles();

  return (<Router>
    <Drawer
      variant="permanent"
      anchor="left"
      className={classes.drawer}
      classes={{paper: classes.drawerPaper}}
    >
      <List>
        {
          routes.map(route => (
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
          routes.map(route => (
            <Route path={route.path} key={route.path}>
                <route.View />
            </Route>
          ))
        }
      </Switch>
    </main>
  </Router>)
}

ReactDOM.render(<Root />, document.getElementById('root'));
