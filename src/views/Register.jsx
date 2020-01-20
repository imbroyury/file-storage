import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Button,
  Grid,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { requestStatuses } from '../uploadStatuses';
import { inputConfig, inputType } from '../shared/inputs';
import errors from '../shared/errors';

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

const Register = () => {
  const classes = useStyles();

  const [shouldInitRegister, setShouldInitRegister] = useState(false);
  const [registerState, setRegisterState] = useState(requestStatuses.uninitialized);
  const [registerError, setRegisterError] = useState(null);

  const [inputs, setInputs] = useState({
    [inputType.email]: '',
    [inputType.password]: '',
    [inputType.login]: '',
  });

  const [inputErrors, setInputErrors] = useState({
    [inputType.email]: false,
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
    if (shouldInitRegister) {
      setRegisterState(requestStatuses.running);

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      const body =
      [
        inputType.email,
        inputType.login,
        inputType.password
      ].reduce((body, type) => ({ ...body, [type]: inputs[type] }), {});

      const register = async () => {
        try {
          await axios.post(
            '/register',
            body,
            { cancelToken: source.token },
          );
          setRegisterState(requestStatuses.done);
        } catch(e) {
          if (axios.isCancel(e)) return;
          if (e.response.status === 409) {
            setRegisterError(e.response.data);
          } else {
            setRegisterError(errors.somethingWentWrong);
          }
          setRegisterState(requestStatuses.error);
        }
      };

      register();

      return source.cancel;
    }
  }, [inputs, shouldInitRegister]);

  const resetRegisterState = () => {
    setShouldInitRegister(false);
    setRegisterState(requestStatuses.uninitialized);
    setRegisterError(null);
  }

  const initializeRegister = () => setShouldInitRegister(true);

  const isInputDisabled = registerState !== requestStatuses.uninitialized;

  const isRegisterDisabled =
    Object.values(inputs).some(input => input.length === 0) ||
    Object.values(inputErrors).some(error => error) ||
    registerState !== requestStatuses.uninitialized;

  const renderSuccessMessage = () =>
  (<Snackbar
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    open
    >
    <SnackbarContent
      className={classes.snackbarSuccess}
      message={
        <span className={classes.snackbarMessage}>
          <CheckCircleIcon className={classes.snackbarIcon}/>
          Done! You've successfully registered an account. Please log in to proceed.
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
    onClose={resetRegisterState}
    >
    <SnackbarContent
      className={classes.snackbarError}
      message={
        <span className={classes.snackbarMessage}>
          <ErrorIcon className={classes.snackbarIcon}/>
          {registerError}
        </span>
      }
    />
  </Snackbar>);

  return (<Grid container>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>Register to use FileStorage service</Typography>
        <Grid container>
          <TextField
              label="Email"
              name={inputType.email}
              value={inputs.email}
              onChange={handleInputChange}
              type="email"
              error={inputErrors[inputType.email]}
              helperText={inputConfig[inputType.email].message}
              disabled={isInputDisabled}
            />
        </Grid>
        <Grid container>
          <TextField
              label="Login"
              name={inputType.login}
              value={inputs.login}
              onChange={handleInputChange}
              disabled={isInputDisabled}
            />
        </Grid>
        <Grid container>
          <TextField
              label="Password"
              name={inputType.password}
              value={inputs.password}
              onChange={handleInputChange}
              type="password"
              error={inputErrors[inputType.password]}
              helperText={inputConfig[inputType.password].message}
              disabled={isInputDisabled}
            />
        </Grid>
        <Grid container>
          <Button
            variant="contained"
            onClick={initializeRegister}
            color="primary"
            disabled={isRegisterDisabled}
          >
            Register
          </Button>
        </Grid>
      </Paper>
      {registerState === requestStatuses.done && renderSuccessMessage()}
      {registerState === requestStatuses.error && renderErrorMessage()}
    </Grid>);
}

export default Register;
