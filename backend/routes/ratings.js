import express from 'express';
import jwt from 'jsonwebtoken';

import authenticator from '../middleware/authenticator.js';
import { checkQueryParams } from '../middleware/checkParams.js';
import { adminOnly, readWrite } from '../middleware/dbPriv.js';

const router = express.Router();


router.get('/', authenticator(false), async (req, res) => {
  const page = Number(req.query.page || 1);
  const resultsPerPage = 20;
  const rowOffset = (page - 1) * resultsPerPage;
  const email = req.decodedToken.userEmail;

  // Validate page
  if (page < 1 || page % 1 !== 0 || Number.isNaN(page)) {
    return res.status(400).json({ error: true, message: 'Invalid page parameter. Must be an integer greater than or equal to 1.' });
  }

  // Fetch ratings data
  let query = req.dbRead.from('ratings')
    .where({ userEmail: email });
    

  const data = await query.clone()
  .select('propertyId as rentalId', 'rating', 'comment', 'dateTime')
  .limit(resultsPerPage)
  .offset(rowOffset);
  const { totalResults } = await query.clone()
  .count('id as totalResults')
  .first();

  // Clean null comments from data
  const cleanData = data.map(object => {
    const cleanedItem = {
      rentalId: object.rentalId,
      rating: object.rating,
    }
    if (object.comment !== null) {
      cleanedItem.comment = object.comment;
    }
    cleanedItem.dateTime = object.dateTime;
    return cleanedItem;
  })

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const pagination = {
    total: totalResults,
    lastPage: totalPages,
    prevPage: page - 1 < 1 ? null : page - 1,
    nextPage: page + 1 > totalPages ? null : page + 1,
    perPage: resultsPerPage,
    currentPage: page,
    from: rowOffset,
    to: rowOffset + cleanData.length,
  }

  const responseObject = { data: cleanData, pagination }
  return res.status(200).json(responseObject);
});

router.post('/debugEraseRatings', adminOnly, async (req, res) => {
  await req.dbAdmin.from('ratings')
    .delete()
  await req.dbAdmin.from('data')
    .select('*')
    .update({ averageRating: null, numRatings: 0 })
  res.status(200).json({ message: "All ratings successfully erased." })
});

router.post('/rentals/:id', authenticator(false), readWrite, async (req, res) => {
  const { rating, comment } = req.body;
  const propertyId = req.params.id;
  const userId = req.decodedToken.userId;
  const userEmail = req.decodedToken.userEmail;
  const responseObject = { rating };

  // Validate rating is int between 1 and 5
  if (rating > 5 || rating < 1 || (rating % 1 !== 0)) {
    return res.status(400).json({ error: true, message: "Invalid rating. Rating must be an integer value between 1 and 5." });
  }

  // Validate comment is string, and between 1 and 2000 chars long
  if (comment !== undefined) {
    if ((typeof (comment) !== 'string') || comment.length < 1 || comment.length > 2000) {
      return res.status(400).json({ error: true, message: "Invalid comment parameter. Comment must be a string 1-2000 characters long." })
    }
    responseObject.comment = comment;
  }

  // Validate property id
  const property = await req.dbRead.from('data')
    .where({ id: propertyId })
    .first()
  if (!property) {
    return res.status(404).json({ error: true, message: "No rental exists with this ID." })
  }

  // Try updating data in table, returns 0 if nothing to update
  const updated = await req.dbWrite.from('ratings')
    .where({ propertyId, userId })
    .update({ rating, comment: (comment ? comment : null) });

  // Catch if update failed and add data
  if (!updated) {
    await req.dbWrite.from('ratings')
      .insert({ propertyId, userId, userEmail, rating, comment })
  };

  // Get ratings data and update in data table
  const ratingsStats = await req.dbRead.from('ratings')
    .where('propertyId', '=', propertyId)
    .avg('rating as averageRating')
    .count('id as numRatings')
    .first();

  await req.dbWrite.from('data')
    .where({ id: propertyId })
    .update({ averageRating: ratingsStats.averageRating, numRatings: ratingsStats.numRatings });

  // Get date time rating was made/updated
  [responseObject.dateTime] = await req.dbRead.from('ratings')
    .where({ propertyId, userId })
    .pluck('dateTime');

  return res.status(201).json(responseObject);
});

router.get('/rentals/:id', checkQueryParams([]), authenticator(false), async (req, res) => {
  const propertyId = req.params.id;
  const userId = req.decodedToken.userId;
  const responseObject = {};

  const ratingData = await req.dbRead.from('ratings')
    .select('*')
    .where({ propertyId, userId })
    .first()

  if (!ratingData) {
    return res.status(404).json({ error: true, message: 'No rating exists with this rental ID.' })
  }

  responseObject.rating = ratingData.rating;
  if (ratingData.comment !== null) {
    responseObject.comment = ratingData.comment;
  }
  responseObject.dateTime = ratingData.dateTime;
  return res.status(200).json(responseObject)
});


export default router;