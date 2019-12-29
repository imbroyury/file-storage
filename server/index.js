import express from 'express';
import path from 'path';
import multer from 'multer';
import progress from 'progress-stream';
import WebSocket from 'ws';
import { writeUploadedMeta, readAllUploadedMeta, readUploadedMeta, getPathToUploadedFile } from './fileStorage';
import { UPLOAD_ID_PREFIX, PERCENTAGE_PREFIX } from '../src/shared/constants';
import { isMessagePrefixed, extractPrefixedPayload } from '../src/shared/helpers';
const server = express();
const upload = multer({ dest: 'server/uploaded-files/' }).single('file');

const BUILD_FOLDER = path.join(__dirname, '..', 'build');
const HTTP_PORT = 8280;
const WS_PORT = 8281;

const wsServer = new WebSocket.Server({ port: WS_PORT });

// id: connection storage
const wsConnections = {};

wsServer.on('connection', connection => {
    connection.on('message', message => {
      if (isMessagePrefixed(message, UPLOAD_ID_PREFIX)) {
        const id = extractPrefixedPayload(message, UPLOAD_ID_PREFIX);
        wsConnections[id] = connection;
      }
    });
});

server.use(express.static(BUILD_FOLDER));

// API
server.get('/get-all-files', async (req, res) => {
  try {
    const allUploadedMeta = await readAllUploadedMeta();
    res.send(allUploadedMeta);
  } catch(e) {
    res.status(500);
  }
});

server.post('/upload-file', function (req, res) {
  const { uploadId } = req.query;
  const reqProgress = progress({ time: 50, length: req.headers['content-length'] });
  // pipe to track progress
  req.pipe(reqProgress);
  // preserve headers
  reqProgress.headers = req.headers;
  reqProgress.on('progress', (progressInfo) => {
    const progressPercentage = Math.round(progressInfo.percentage);
    console.log(uploadId, ' progress :', progressPercentage);
    const wsConnection = wsConnections[uploadId];
    if (wsConnection) wsConnection.send(`${PERCENTAGE_PREFIX}${progressPercentage}`);
  });
  upload(reqProgress, res, async (err) => {
    if (err) return res.status(500);
    const { body, file } = reqProgress;
    const { originalname, filename } = file;
    const wsConnection = wsConnections[uploadId];
    if (wsConnection) wsConnection.terminate();
    await writeUploadedMeta(originalname, body.comment, filename);
    res.send('Upload successful');
  });
});

server.get('/download', async (req, res) => {
  const { id } = req.query;
  const meta = await readUploadedMeta(id);
  res.download(
    getPathToUploadedFile(meta.savedFilename),
    meta.originalFilename,
  );
})

// For everything else, serve index file
server.get('*', function (req, res) {
  res.sendFile(path.join(BUILD_FOLDER, 'index.html'));
});

server.listen(HTTP_PORT, function () {
  console.log(`FileStorage listening on port ${HTTP_PORT}!`);
});