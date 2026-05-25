import { admin, readWriteOnly } from '../knexfile.js';

export const readWrite = (req, res, next) => {
    req.dbWrite = readWriteOnly;
    next()
}

export const adminOnly = (req, res, next) => {
    req.dbAdmin = admin;
    next();
}