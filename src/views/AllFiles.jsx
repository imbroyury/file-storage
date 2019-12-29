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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  paper: {
    padding: '20px',
  },
  card: {
    margin: '10px',
  }
});

const AllFiles = () => {
  const classes = useStyles();

  const [error, setError] = useState();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get('/get-all-files')
      .then(({ data: files }) => {
        setFiles(files);
      })
      .catch(e => setError(e));
  }, []) // componentDidMount - empty dependency array

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
      <Button href={`/download?id=${file.id}`} color="primary" variant="outlined">Download</Button>
    </CardActions>
  </Card>)

  return (<Grid container>
    {error && renderError()}
    {(files.length === 0 && !error) && renderNoFiles()}
    {files.map(renderFile)}
  </Grid>);
}

export default AllFiles;
