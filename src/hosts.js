const HTTP_PROTOCOL = 'http';
const WS_PROTOCOL = 'ws';

const LOCAL_HOST = 'localhost';
const REMOTE_HOST = '178.172.195.18';

const HTTP_PORT = '8280';
const WS_PORT = '8281';

const isDevEnv = process.env.NODE_ENV === 'development';

const getUrl = (protocol, host, port) => `${protocol}://${host}:${port}`;

const getHTTPUrl = (host) => getUrl(HTTP_PROTOCOL, host, HTTP_PORT);
const getWSUrl = (host) => getUrl(WS_PROTOCOL, host, WS_PORT);

export const HTTP_URL = isDevEnv
    ? getHTTPUrl(LOCAL_HOST)
    : getHTTPUrl(REMOTE_HOST);
    
export const WS_URL = isDevEnv
    ? getWSUrl(LOCAL_HOST)
    : getWSUrl(REMOTE_HOST);