export const getStates = async () => {
  try {
    const response = await fetch(`/rentals/property-types`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const getPropertyTypes = async () => {
  try{
    const response = await fetch(`/rentals/states`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const getRental = async (id) => {
  try {
    const url = `/rentals/${id}`
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const getRentals = async (queryString) => {
  const url = `/rentals/search?${queryString}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const getPostcodes = async (center, bounds, currentPropertyPC) => {
  const postcodes = [];
  // Required as postcode api looks for center of postcode, however this could be outside radius of
  // search, despite property being in that postcode, ensures no matter what, the property being viewed
  // will show on the map
  if (currentPropertyPC) postcodes.push(currentPropertyPC);
  // Find radius for postcode search
  const dy = bounds.ne[0] - center[0];
  const dx = bounds.ne[1] - center[1];
  const distanceInDegrees = Math.sqrt(dy * dy + dx * dx);
  const distanceInMeters = Math.max(Math.min(distanceInDegrees * 111000, 4000), 1500);

  // Fetch postcodes visible on map (need a proxy to bypass CORS restrictions)
  const targetURL = `/postcodeAPI/postcodes?&latitude=${center[0]}&longitude=${center[1]}&distance=${distanceInMeters}`

  try {
    const response = await fetch(targetURL)
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    data.forEach((item) => {
      // console.log(data)
      if (!postcodes.includes(item.postcode) && item.locality !== null) {
        postcodes.push(item.postcode);
      }
    });
  } catch (e) {
    console.error(e);
    return postcodes;
  }
  return postcodes;

}


export const getSuburbCenter = async (searchFilters) => {
  let query = `/postcodeAPI/suburbCenter`;

  if (searchFilters.postcode) query += `postcode=${searchFilters.postcode}`
  else if (searchFilters.suburb !== '') query += `name=${encodeURIComponent(searchFilters.suburb)}&state=${searchFilters.state}`
  else return null;

  try {
    const response = await fetch(query);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    if (data.length === 0) return null;
    return ([data[0].latitude, data[0].longitude])
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const getPropertyRating = async (token, propertyID) => {
  const apiCall = `/ratings/rentals/${propertyID}`
  try {
    const response = await fetch(apiCall, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const getAllPropertyRatings = async (token, page) => {
  const query = `/ratings?page=${page}`
  try {
    const response = await fetch(query, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } })
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const getTopProperties = async () => {
  const apiFilters = new URLSearchParams({
    sortBy: 'numRatings',
    sortOrder: 'desc',
    minimumRating: 4
  })
  try {
    return await getRentals(apiFilters.toString());
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const postAuth = async (newUser, credentials) => {

  const apiCall = `/user` + (newUser ? '/register' : '/login');
  try {
    const response = await fetch(apiCall, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    } else {
      return data;
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}


export const postRating = async (token, propertyID, rating) => {
  const apiCall = `/ratings/rentals/${propertyID}`
  try {
    const response = await fetch(apiCall, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ rating: (rating) }) });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message)
    }
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}