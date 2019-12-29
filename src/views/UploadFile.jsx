import axios from 'axios';
import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Button,
  LinearProgress,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import uuid from 'uuid/v1';

const useStyles = makeStyles({
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
  }
});

const UPLOAD_STATUS_ENUM = {
  uninitialized: 'uninitialized',
  running: 'running',
  done: 'done',
  error: 'error',
}

const UploadFile = () => {
  const classes = useStyles();
  const [fileList, setFileList] = useState(null);
  const [uploadState, setUploadState] = useState(UPLOAD_STATUS_ENUM.uninitialized);
  const [comment, setComment] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const handleCommentChange = (e) => setComment(e.target.value);

  const handleChangeFileList = (e) => setFileList(e.target.files);

  const establishWebSocketConnection = (id) => {
    const url = 'ws://localhost:8281';
    const connection = new WebSocket(url);

    connection.onopen = () => {
        connection.send(`UploadId: ${id}`);
    };

    connection.onmessage = (event) => {
      const { data: percentage } = event;
        console.log('from server: ' + percentage);
        setUploadPercentage(Number(percentage));
    }

    connection.onerror = (error) => {
        console.log('WebSocket error:', error);
    };

    connection.onclose = () => {
        console.log('WebSocket connection closed');
    };
  };

  const composeFormData = () => {
    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);
    return formData;
  }

  const handleUpload = async () => {
    setUploadState(UPLOAD_STATUS_ENUM.running);

    const uploadId = uuid();
    const formData = composeFormData();

    establishWebSocketConnection(uploadId);

    await axios.post(`/upload-file?uploadId=${uploadId}`, formData);

    setUploadState(UPLOAD_STATUS_ENUM.done);
  };

  const renderUploadMessage = () => (fileList === null || fileList.length === 0)
      ? <Typography>No file chosen</Typography>
      : <Typography variant="overline" className={classes.fileLabel}>{fileList[0].name}</Typography>

  const getIsSubmiDisabled = () =>
    fileList === null ||
    fileList.length === 0 ||
    uploadState !== UPLOAD_STATUS_ENUM.uninitialized;

  return (<Grid container>
    <Paper className={classes.paper}>
      <Typography variant="h4" gutterBottom>Upload new file</Typography>
      <Grid container>
        <Button
          variant="contained"
          component="label"
        >
          Choose File
          <input
            type="file"
            className={classes.uploadInput}
            onChange={handleChangeFileList}
          />
        </Button>
        {renderUploadMessage()}
      </Grid>
      <Grid container>
        <TextField
            label="Comment"
            multiline
            rowsMax="4"
            value={comment}
            onChange={handleCommentChange}
            variant="filled"
          />
      </Grid>
      <Grid container>
        <Button
          variant="contained"
          onClick={handleUpload}
          color="primary"
          disabled={getIsSubmiDisabled()}
        >
          Upload
        </Button>
      </Grid>
      {
        uploadState !== UPLOAD_STATUS_ENUM.uninitialized &&
        <>
          <Typography>{uploadPercentage}</Typography>
          <LinearProgress variant="determinate" value={uploadPercentage} />
        </>
      }
    </Paper>
  </Grid>);
}

export default UploadFile;
