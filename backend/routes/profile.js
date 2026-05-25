import express from 'express';
import validateDate from 'validate-date';

import authenticator from '../middleware/authenticator.js';
import { readWrite } from '../middleware/dbPriv.js';

const router = express.Router();

router.get('/:email/profile', authenticator(true), async (req, res, next) => {
  const email = req.params.email;
  const authEmail = req.decodedToken?.userEmail;
  const user = await req.dbRead.from('users')
    .where({ email })
    .first();

  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  // Set up base response
  const responseObject = {
    email,
    firstName: user.firstName,
    lastName: user.lastName
  }

  // Check if auth matches, if it does include extra info
  if (email === authEmail) {
    responseObject.dob = user.dob;
    responseObject.address = user.address;
  }

  return res.status(200).json(responseObject)
});

router.put('/:email/profile', authenticator(false), readWrite, async (req, res, next) => {
  const email = req.params.email;
  const authEmail = req.decodedToken?.userEmail;
  const { firstName, lastName, dob, address } = req.body;
  const validBody = ['firstName', 'lastName', 'dob', 'address'];

  // Validate user attemping to be modified exists
  const user = await req.dbRead.from('users')
    .where({ email })
    .first('id');
  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  // Validate user attemping to be modified is authenticated user
  if (email !== authEmail) {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  };

  // Validate all required params are present, with no additional params
  if (!firstName || !lastName || !dob || !address) {
    return res.status(400).json({ error: true, message: 'Request body incomplete: firstName, lastName, dob and address are required.' })
  }

  // Validate names and address are strings
  if (typeof (firstName) !== 'string' || typeof (lastName) !== 'string' || typeof (address) !== 'string') {
    return res.status(400).json({ error: true, message: 'Request body invalid: firstName, lastName and address must be strings only.' })
  }

  // Validate dob is date format
  if (!validateDate(dob, 'boolean', 'YYYY-MM-DD') || dob.length !== 10) {
    return res.status(400).json({ error: true, message: 'Invalid input: dob must be a real date in format YYYY-MM-DD.' })
  }

  // Validate dob is not in the future
  const inputDate = new Date(dob);
  const currentDate = new Date();
  if (inputDate > currentDate) {
    return res.status(400).json({ error: true, message: 'Invalid input: dob must be a date in the past.' })
  }

  // If all checks pass, update users information and return response
  await req.dbWrite.from('users')
    .where({ email })
    .update({ firstName, lastName, dob, address })

  return res.status(200).json({ email, firstName, lastName, dob, address })
});

export default router;