import express from 'express';

import { checkQueryParams } from '../middleware/checkParams.js'
const router = express.Router();


const FILTER_MAP = {
  suburb: ['suburb', '=', 'string'],
  state: ['state', '=', 'string'],
  propertyTypes: ['propertyType', '=', 'string'],
  postcode: ['postcode', '=', 'int'],
  minimumRent: ['rent', '>=', 'int'],
  maximumRent: ['rent', '<=', 'int'],
  minimumBathrooms: ['bathrooms', '>=', 'int'],
  maximumBathrooms: ['bathrooms', '<=', 'int'],
  minimumBedrooms: ['bedrooms', '>=', 'int'],
  maximumBedrooms: ['bedrooms', '<=', 'int'],
  minimumParking: ['parkingSpaces', '>=', 'int'],
  maximumParking: ['parkingSpaces', '<=', 'int'],
  minimumRating: ['averageRating', '>=', 'int'],
  maximumRating: ['averageRating', '<=', 'int'],
}


// Function for states and property types fetch
const fetchConstants = async (req, res, item) => {
  // Fetch data from DB
  try {
    const rows = await req.dbRead.from('data')
      .distinct(item)
      .orderBy(item, 'asc')
      .pluck(item);

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Database query failed' });
  }
}


// Fetch unique states from DB and return
router.get('/states', checkQueryParams([]), async (req, res) => {
  return await fetchConstants(req, res, 'state');
})


// Fetch unique property types from DB and return
router.get('/property-types', checkQueryParams([]), async (req, res) => {
  return await fetchConstants(req, res, 'propertyType');
})

router.get('/search', async (req, res) => {
  const querys = req.query;
  const page = Number(req.query.page || 1);
  const resultsPerPage = 10;
  const rowOffset = (page - 1) * resultsPerPage;
  const validSortBy = ['id', 'title', 'rent', 'propertyType', 'latitude', 'longitude', 'postcode', 'state', 'suburb', 'bathrooms', 'bedrooms', 'parkingSpaces', 'averageRating', 'numRatings']
  const sortBy = querys.sortBy || 'id';
  const sortOrder = req.query.sortOrder || 'asc';
  let dbQuery = req.dbRead.from('data');

  // Validate page
  if (page < 1 || page % 1 !== 0 || Number.isNaN(page)) {
    return res.status(400).json({ error: true, message: 'Invalid page parameter. Must be an integer greater than or equal to 1.' });
  }

  // Validate sort order
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return res.status(400).json({ error: true, message: "Invalid sortOrder parameter. Must be 'asc' or 'desc'." })
  } else if (querys.sortOrder && !querys.sortBy) {
    return res.status(400).json({ error: true, message: "Invalid sortOrder parameter. sortBy must be specified." })
  }

  // Validate sort by
  if (!validSortBy.includes(sortBy)) {
    return res.status(400).json({ error: true, message: 'Invalid sortBy parameter. Must refer to a valid sortable property.' });
  }
  dbQuery = dbQuery.orderBy(sortBy, sortOrder);

  // Handle filters
  for (const [key, value] of Object.entries(querys)) {
    // Exit early if query is not in the filters map
    if (!Object.keys(FILTER_MAP).includes(key)) continue;

    const [column, operator, handler] = FILTER_MAP[key];

    if (handler === 'int') {
      const number = Number(value);

      if (key === 'postcode' && (number < 0 || number > 9999 || number % 1 !== 0 || Number.isNaN(number))) {
        return res.status(400).json({ error: true, message: 'Invalid postcode parameter. Must be an integer in the range of 0000-9999.' });
      } else if (number < 0 || Number.isNaN(number)) {
        return res.status(400).json({ error: true, message: `Invalid ${key} parameter. Must be a non-negative integer.` });
      }
      dbQuery = dbQuery.where(column, operator, number);

    } else if (handler === 'string') {
      dbQuery = Array.isArray(value)
      ? dbQuery.whereIn(column, value)
      : dbQuery.where(column, operator, value);
    }
  }

  // Fetch results to be returned
  const results = await dbQuery.clone().limit(resultsPerPage).offset(rowOffset);

  // Handle pagination response
  const { totalResults } = await dbQuery.clone().count('id as totalResults').first();
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const pagination = {
    perPage: resultsPerPage,
    currentPage: page,
    from: rowOffset,
    to: rowOffset + results.length,
    total: totalResults,
    lastPage: totalPages,
    prevPage: page - 1 < 1 ? null : page - 1,
    nextPage: page + 1 > totalPages ? null : page + 1,
  }

  const returnObject = { data: results, pagination }
  return res.status(200).json(returnObject);
})

// Fetch specific rental property with ID
router.get('/:id', checkQueryParams([]), async (req, res) => {
  const rentalID = req.params.id;
  try {
    // Get property data
    const propertyData = await req.dbRead.from('data')
      .where('id', '=', rentalID)
      .first()

    // Return if property ID invalid
    if (!propertyData) {
      return res.status(404).json({ error: true, message: 'No rental exists with this ID.' })
    }

    // Get ratings data
    const ratingsData = await req.dbRead.from('ratings')
      .where('propertyId', '=', rentalID)
      .select('rating', 'userEmail as user', 'comment', 'dateTime');

    // Clean Data
    delete propertyData.id;
    const cleanRatings = ratingsData.map(data => {
      if (data.comment === null) delete data.comment;
      return data;
    });

    // Build and return response
    const responseObject = { ...propertyData, reviews: cleanRatings }
    return res.status(200).json(responseObject)

  } catch (err) {
    res.status(500).json({ error: true, message: 'Database error' })
  }
})


export default router;