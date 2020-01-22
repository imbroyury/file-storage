import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import multer from 'multer';
import progress from 'progress-stream';
import WebSocket from 'ws';
import WSConnectionsStorage from './WSConnectionsStorage';
import DBService from './DBService';
import EmailService from './EmailService';
import { writeUploadedMeta, readAllUploadedMeta, readUploadedMeta, getPathToUploadedFile } from './fileStorage';
import { encryptPassword, generateToken } from './crypto';
import { UPLOAD_ID_PREFIX, PERCENTAGE_PREFIX } from '../src/shared/constants';
import { isMessagePrefixed, extractPrefixedPayload, prefixMessage } from '../src/shared/helpers';
import { HTTP_PORT, WS_PORT } from '../src/shared/hosts';
import errors from '../src/shared/errors';
import headers from '../src/shared/headers';

const server = express();
server.use(bodyParser.json());
const upload = multer({ dest: 'server/uploaded-files/' }).single('file');

const BUILD_FOLDER = path.join(__dirname, '..', 'build');

const wsServer = new WebSocket.Server({ port: WS_PORT });

// id: connection storage
const wsConnections = new WSConnectionsStorage(10000, 5000);

wsServer.on('connection', connection => {
    connection.on('message', message => {
      if (isMessagePrefixed(message, UPLOAD_ID_PREFIX)) {
        const id = extractPrefixedPayload(message, UPLOAD_ID_PREFIX);
        wsConnections.addConnection(id, connection);
      }
    });
});

server.get('/confirmEmail', async (req, res) => {
  try {
    const { confirmationToken } = req.query;
    await DBService.confirmAccountByToken(confirmationToken);
    res.redirect('/login');
  } catch (e) {
    res.status(500).send(errors.somethingWentWrong);
  }
});

server.use(express.static(BUILD_FOLDER));

// API
server.get('/get-all-files', async (req, res) => {
  try {
    const userToken = req.headers[headers.userToken];
    const userId = await DBService.getUserIdBySessionToken(userToken);
    if (userId === null) return res.status(401).send();
    const allUploadedMeta = await readAllUploadedMeta(userId);
    res.send(allUploadedMeta);
  } catch(e) {
    res.status(500);
  }
});

server.post('/upload-file', async (req, res) => {
  const { uploadId } = req.query;
  const userToken = req.headers[headers.userToken];
  const userId = await DBService.getUserIdBySessionToken(userToken);
  if (userId === null) return res.status(401).send();
  const reqProgress = progress({ time: 50, length: req.headers['content-length'] });
  // pipe to track progress
  req.pipe(reqProgress);
  // preserve headers
  reqProgress.headers = req.headers;

  reqProgress.on('progress', (progressInfo) => {
    const progressPercentage = Math.floor(progressInfo.percentage);
    const message = prefixMessage(progressPercentage, PERCENTAGE_PREFIX);
    wsConnections.sendMessageToConnection(uploadId, message);
    wsConnections.updateLastActivity(uploadId);
    if (progressPercentage === 100) wsConnections.terminateConnection(uploadId);
  });

  upload(reqProgress, res, async (err) => {
    if (err) return res.status(500);

    const { body, file } = reqProgress;
    const { originalname, filename } = file;

    await writeUploadedMeta(userId, originalname, body.comment, filename);

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
});

server.post('/register', async (req, res) => {
  const { email, login, password } = req.body;

  try {
    const userByEmail = await DBService.getUserByEmail(email);
    if (userByEmail !== null) return res.status(409).send(errors.emailAlreadyInUse);

    const userByLogin = await DBService.getUserByLogin(login);
    if (userByLogin !== null) return res.status(409).send(errors.loginAlreadyInUse);

    const encryptedPassword = await encryptPassword(password);
    const isUserCreated = await DBService.createUser(email, login, encryptedPassword);

    if (isUserCreated) {
      const confirmationToken = await generateToken();
      await DBService.putConfirmationTokenForAccount(email, confirmationToken);
      await EmailService.sendConfirmationEmail(email, login, confirmationToken);

      res.status(200).send();
    } else {
      res.status(500).send();
    }
  } catch (e) {
    return res.status(500).send();
  }
});

server.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const userByLogin = await DBService.getUserByLogin(login);
    if (userByLogin === null) return res.status(401).send(errors.invalidCredentials);

    const encryptedPassword = await encryptPassword(password);
    if (encryptedPassword !== userByLogin.password) return res.status(401).send(errors.invalidCredentials);

    const isAccountConfirmed = await DBService.getIsAccountConfirmedByLogin(login);
    if (!isAccountConfirmed) return res.status(401).send(errors.accountNotConfirmed)

    const token = await generateToken();
    await DBService.putSessionForUser(userByLogin.id, token);

    res.status(200).send({ token });

  } catch (e) {
    res.status(500).send();
  }
});

// For everything else, serve index file
server.get('*', (req, res) => {
  res.sendFile(path.join(BUILD_FOLDER, 'index.html'));
});

server.listen(HTTP_PORT, () => {
  console.log(`FileStorage listening on port ${HTTP_PORT}!`);
});
