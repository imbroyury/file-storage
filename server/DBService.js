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
            VALUES (?, ?, ?)
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

const putSessionForUser = async (userId, token) => {
    try {
        await queryPool(`
            INSERT INTO sessions (user_id, token)
            VALUES (?, ?)
        `, [userId, token]);
    } catch(e) {
        throw e;
    }
};

const putConfirmationTokenForEmail = async (email, token) => {
    try {
        const userByEmail = await getUserByEmail(email);
        await queryPool(`
            INSERT INTO confirmations (user_id, token, is_confirmed)
            VALUES (?, ?, 0)
        `, [userByEmail.id, token]);
    } catch (e) {
        throw e;
    }
}

const confirmEmailByToken = async (token) => {
    try {
        await queryPool(`
            UPDATE confirmations
            SET is_confirmed = 1
            WHERE token = ?
        `, token)
    } catch (e) {
        throw e;
    }
}

const getUserIdBySessionToken = async (token) => {
    try {
        const response = await queryPool(`
            SELECT user_id FROM sessions
            WHERE token = ?
        `, token);

        if (response.result.length > 0) return response.result[0].user_id;

        return null;
    } catch(e) {
        throw e;
    }
}

export default {
    createUser,
    getUserByEmail,
    getUserByLogin,
    putSessionForUser,
    getUserIdBySessionToken,
    putConfirmationTokenForEmail,
    confirmEmailByToken,
}
