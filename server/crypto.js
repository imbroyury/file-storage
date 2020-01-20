import crypto from 'crypto';
import util from 'util';

const scrypt = util.promisify(crypto.scrypt);
const randomBytes = util.promisify(crypto.randomBytes);

const SALT = 'SecretSaltForCookingPasswords';
const KEYLEN = 64;
const TOKENLEN = 32;

export const encryptPassword = async (password) => {
    try {
        const derivedKey = await scrypt(password, SALT, KEYLEN);
        return derivedKey.toString('hex');
    } catch(e) {
        throw e;
    }
}

export const generateToken = async () => {
    try {
        const buffer = await randomBytes(TOKENLEN);
        return buffer.toString('hex');
    } catch(e) {
        throw e;
    }
}