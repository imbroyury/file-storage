import mysql from 'mysql';
import mysqlCredentials from './mysql-credentials.json';

const pool = mysql.createPool({
    connectionLimit : 20,
    database: 'file_storage',
    ...mysqlCredentials
});

const queryPool = async (query, values) => new Promise((resolve, reject) => {
    pool.query(query, values, (err, result, fields) => {
        if (err) return reject(err);
        resolve({ result, fields });
    });
});

const createUser = async (email, login, password) => {
    try {
        const response = await queryPool(`
            INSERT INTO users (email, login, password)
            VALUES (?, ?, ?);
        `, [email, login, password]);

        if (response.result.affectedRows === 1) return true;

        return false;
    } catch(e) {
        throw e;
    }
};

const getUserByEmail = async (email) => {
    try {
        const response = await queryPool(`
            SELECT * FROM users
            WHERE email = ?
        `, email);
        if (typeof response === 'undefined') {
            return null;
        }
        return response.result[0] || null;
    } catch (e) {
        throw e;
    }
};

const getUserByLogin = async (login) => {
    try {
        const response  = await queryPool(`
            SELECT * FROM users
            WHERE login = ?
        `, login);
        if (typeof response === 'undefined') {
            return null;
        }
        return response.result[0] || null;
    } catch(e) {
        throw e;
    }
};

export default {
    createUser,
    getUserByEmail,
    getUserByLogin,
}
