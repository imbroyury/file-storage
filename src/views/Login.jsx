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
import { inputType, inputConfig } from '../shared/inputs';
import errors from '../shared/errors';
import AuthService from '../AuthService';
import { Redirect } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: '2rem',
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

const Login = (props) => {
  const classes = useStyles();

  const [shouldInitLogin, setShouldInitLogin] = useState(false);
  const [loginState, setLoginState] = useState(requestStatuses.uninitialized);
  const [loginError, setLoginError] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const [inputs, setInputs] = useState({
    [inputType.login]: '',
    [inputType.password]: '',
  });

  const [inputErrors, setInputErrors] = useState({
    [inputType.password]: false,
  });

  const setInputError = (name, value) => {
    const { validator } = inputConfig[name];
    if (typeof validator === 'function') {
      setInputErrors(errors => ({...errors, [name]: !validator(value)}));
    }
  }

  const handleInputChange = (event) => {
    event.persist();
    const { name, value } = event.target;
    setInputs(inputs => ({...inputs, [name]: value}));
    setInputError(name, value);
  }

  useEffect(() => {
    if (shouldInitLogin) {
      setLoginState(requestStatuses.running);

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      const body =
      [
        inputType.login,
        inputType.password
      ].reduce((body, type) => ({ ...body, [type]: inputs[type] }), {});

      const login = async () => {
        try {
          const response = await axios.post(
            '/login',
            body,
            { cancelToken: source.token },
          );
          AuthService.saveAuthData(inputs[inputType.login], response.data.token);
          props.loginUser();
          setLoginState(requestStatuses.done);
        } catch(e) {
          if (axios.isCancel(e)) return;
          if (e.response.status === 401) {
            setLoginError(e.response.data);
          } else {
            setLoginError(errors.somethingWentWrong);
          }
          setLoginState(requestStatuses.error);
        }
      };

      login();

      return source.cancel;
    }
  }, [inputs, props, shouldInitLogin]);

  const resetLoginState = () => {
    setShouldInitLogin(false);
    setLoginState(requestStatuses.uninitialized);
    setLoginError(null);
  }

  const initializeLogin = () => setShouldInitLogin(true);

  const isInputDisabled = loginState !== requestStatuses.uninitialized;

  const isLoginDisabled =
    Object.values(inputs).some(input => input.length === 0) ||
    Object.values(inputErrors).some(error => error) ||
    loginState !== requestStatuses.uninitialized;

  const renderSuccessMessage = () =>
  (<Snackbar
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    open
    autoHideDuration={3000}
    onClose={() => setShouldRedirect(true)}
    >
    <SnackbarContent
      className={classes.snackbarSuccess}
      message={
        <span className={classes.snackbarMessage}>
          <CheckCircleIcon className={classes.snackbarIcon}/>
          Done! You've successfully logged in.
        </span>
      }
    />
  </Snackbar>);

const renderErrorMessage = () =>
  (<Snackbar
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    open
    autoHideDuration={3000}
    onClose={resetLoginState}
    >
    <SnackbarContent
      className={classes.snackbarError}
      message={
        <span className={classes.snackbarMessage}>
          <ErrorIcon className={classes.snackbarIcon}/>
          {loginError}
        </span>
      }
    />
  </Snackbar>);

  return (<Grid container>
        <Paper className={classes.paper}>
          <Typography variant="h5" gutterBottom>Enter your credentials to log in</Typography>
          <Grid container>
            <TextField
                label="Login"
                name={inputType.login}
                value={inputs[inputType.login]}
                onChange={handleInputChange}
                disabled={isInputDisabled}
              />
          </Grid>
          <Grid container>
            <TextField
                label="Password"
                name={inputType.password}
                value={inputs[inputType.password]}
                onChange={handleInputChange}
                type="password"
                disabled={isInputDisabled}
                error={inputErrors[inputType.password]}
                helperText={inputConfig[inputType.password].message}
              />
          </Grid>
          <Grid container>
            <Button
              variant="contained"
              onClick={initializeLogin}
              color="primary"
              disabled={isLoginDisabled}
            >
              Log in
            </Button>
          </Grid>
        </Paper>
        {loginState === requestStatuses.done && renderSuccessMessage()}
        {loginState === requestStatuses.error && renderErrorMessage()}
        {shouldRedirect && <Redirect to='/upload-file'/>}
      </Grid>);
}

export default Login;
