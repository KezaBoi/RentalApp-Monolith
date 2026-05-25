import express from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import { checkAuthParams } from '../middleware/checkParams.js';
import { readWrite } from '../middleware/dbPriv.js';
import profileRouter from './profile.js';

const router = express.Router();

const login = async (req, res, expiresIn) => {
  const { email, password } = req.body;

  // Get saved password from DB
  const user = await req.dbRead.from('users')
    .where('email', '=', email)
    .select('*')
    .first()
  // Return error if user doesnt exist
  if (!user) return res.status(401).json({ error: true, message: 'Incorrect email or password' });

  // Verify password
  const verified = await argon2.verify(user.password, password);
  if (verified) {
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const token = jwt.sign({ userId: user.id, userEmail: email, exp }, process.env.JWT_SECRET);
    return res.json({
      token,
      tokenType: "Bearer",
      expiresIn
    });
  } else {
    return res.status(401).json({ error: true, message: 'Incorrect email or password' })
  }
}

// Register a user
router.post('/register', checkAuthParams, readWrite, async (req, res) => {
  const { email, password } = req.body;

  // Determine if user already exists in table
  const user = await req.dbRead.from('users')
    .where('email', '=', email)
    .first()
  if (user) return res.status(409).json({ error: true, message: "User already exists" });

  // If user does not exist, insert into table 
  const hashedPassword = await argon2.hash(password);
  await req.dbWrite.from('users')
    .insert({ email, password: hashedPassword })
  return res.status(201).json({ message: "User Created" });
});


// Login a user
router.post('/login', checkAuthParams, async (req, res) => {
  return await login(req, res, 60 * 60 * 24);
});

router.post('/debugLogin', checkAuthParams, async (req, res) => {
  return await login(req, res, 1);
});

router.use('/', profileRouter);

export default router;