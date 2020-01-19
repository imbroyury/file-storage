import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Grid,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { requestStatuses } from '../uploadStatuses';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: '2rem',
  },
  uploadInput: {
    display: 'none'
  },
  fileLabel: {
    maxWidth: '25rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  snackbarMessage: {
    display: 'flex',
    alignItems: 'center',
  },
  snackbarIcon: {
    fontSize: 20,
    marginRight: '0.5rem',
  },
  snackbarSuccess: {
    backgroundColor: green[600],
  },
  snackbarError: {
    backgroundColor: theme.palette.error.dark,
  }
}));

const Login = () => {
  const classes = useStyles();
  // upload state for useEffect

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginChange = (e) => setLogin(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const initializeLogin = () => console.log('Init login');

  return (<Grid container>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>Enter your credentials to log in</Typography>
        <Grid container>
          <TextField
              label="Login"
              value={login}
              onChange={handleLoginChange}
            />
        </Grid>
        <Grid container>
          <TextField
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              type="password"
            />
        </Grid>
        <Grid container>
          <Button
            variant="contained"
            onClick={initializeLogin}
            color="primary"
          >
            Log in
          </Button>
        </Grid>
      </Paper>
    </Grid>);
}

export default Login;
