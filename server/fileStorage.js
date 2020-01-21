import { promises as fsp } from 'fs';
import path from 'path';
import uuid from 'uuid/v1';

const PATH_TO_META = path.join(__dirname, 'uploaded-meta');
const PATH_TO_UPLOADED = path.join(__dirname, 'uploaded-files');
const IGNORE = ['.gitkeep'];

const writeJSON = async (path, json) => {
    try {
        await fsp.writeFile(path, JSON.stringify(json));
    } catch(e) {
        console.log('Unable to save JSON');
        throw e;
    }
};

const readJSON = async (path) => {
    try {
        const json = await fsp.readFile(path);
        const contents = JSON.parse(json);
        return contents;
    } catch(e) {
        console.log('Unable to read JSON');
        throw e;
    }
}

export const writeUploadedMeta = async (userId, originalFilename, comment, savedFilename) => {
    const id = uuid();
    const pathToFile = path.join(PATH_TO_META, `${id}.json`);
    await writeJSON(pathToFile, {
        userId,
        id,
        savedFilename,
        originalFilename,
        comment,
    });
};

export const readAllUploadedMeta = async (userId) => {
    const list = await fsp.readdir(PATH_TO_META);
    const toRead = list.filter(item => !IGNORE.includes(item));
    const promisedReads = toRead.map(
        (filename) => readJSON(path.join(PATH_TO_META, filename))
            .catch(() => null) // nullify read errors
    );
    const result = (await Promise.all(promisedReads))
        .filter(r => r !== null)
        .filter(r => r.userId === userId);

    return result;
};

export const readUploadedMeta = async (id) => {
    const pathToFile = path.join(PATH_TO_META, `${id}.json`);
    const json = await readJSON(pathToFile);
    return json;
};

export const getPathToUploadedFile = filename => path.join(PATH_TO_UPLOADED, filename);