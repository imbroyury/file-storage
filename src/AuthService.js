const AUTH_DATA = 'FILE_STORAGE_AUTH_DATA';

const saveAuthData = (login, token) => sessionStorage.setItem(AUTH_DATA, JSON.stringify({ login, token }));
const getAuthData = () => JSON.parse(sessionStorage.getItem(AUTH_DATA));

export default {
    saveAuthData,
    getAuthData,
}
