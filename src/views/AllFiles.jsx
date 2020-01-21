import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { requestStatuses } from '../uploadStatuses';
import { HTTP_URL } from '../shared/hosts.js';
import headers from '../shared/headers';
import { Redirect } from 'react-router-dom';
import AuthService from '../AuthService';

const useStyles = makeStyles({
  paper: {
    padding: '20px',
  },
  card: {
    margin: '10px',
  }
});

const AllFiles = (props) => {
  const classes = useStyles();

  const [requestState, setRequestState] = useState(requestStatuses.uninitialized);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const getFiles = async () => {
      try {
        setRequestState(requestStatuses.running);
        const { data: files } = await axios.get(
          '/get-all-files',
          {
            headers: { [headers.userToken]: AuthService.getAuthData().token },
            cancelToken: source.token,
          });
        setRequestState(requestStatuses.done);
        setFiles(files);
      } catch(e) {
        if (axios.isCancel(e)) return;
        setRequestState(requestStatuses.error);
      }
    }

    getFiles();

    return source.cancel;
  }, []);

  const renderError = () => (<Paper className={classes.paper}>
    <Typography variant="h4">Error while fetching files</Typography>
  </Paper>);

  const renderNoFiles = () => (<Paper className={classes.paper}>
    <Typography variant="h4">No files fetched</Typography>
  </Paper>);

  const renderFile = (file) => (<Card key={file.id} className={classes.card}>
    <CardContent>
      <Typography variant="overline">{file.originalFilename}</Typography>
      <Typography>{file.comment}</Typography>
    </CardContent>
    <CardActions>
      <Button
        variant="outlined"
        color="primary"
        href={`${HTTP_URL}/download?id=${file.id}`}
      >
        Download
      </Button>
    </CardActions>
  </Card>)

  return (<Grid container>
    {!props.isUserLoggedIn && <Redirect to='/login' />}
    {requestState === requestStatuses.error && renderError()}
    {(requestState === requestStatuses.done && files.length === 0) && renderNoFiles()}
    {requestState === requestStatuses.running && <CircularProgress />}
    {files.map(renderFile)}
  </Grid>);
}

export default AllFiles;
