import { useEffect, useMemo } from "react";

import { getAllPropertyRatings } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getRental } from "../services/api";
import MyGrid from "../components/Grid";
import { Box, Tooltip, Typography } from "@mui/material";
import StarHalfIcon from '@mui/icons-material/StarHalf';


const EXTRA_COLUMN = [
  {
    headerComponent: () => (<Tooltip title={'Your Rating'}><StarHalfIcon /></Tooltip>),
    field: 'rating',
    width: 60
  }
]

export default function RatedProperties() {
  const { user } = useAuth();

  const dataSource = useMemo(() => {
    if (!user?.token) return null;
    return {
      getRows: async (params) => {
        const page = (params.startRow / 20) + 1;
        try {
          const propertyRatings = await getAllPropertyRatings(user.token, page);
          // console.log(propertyRatings);
  
          const promises = propertyRatings.data.map(async (property) => {
            const rentalData = await getRental(property.rentalId);
            return { ...rentalData, id: property.rentalId, rating: property.rating };
          });
          const allResults = await Promise.all(promises);
          // console.log(allResults)
          params.successCallback(allResults, propertyRatings.pagination.total)
        } catch (e) {
          params.failCallback();
        }
      }
    }
  }, [user?.token]);

  return (
    <Box
      sx={{
        height: '85vh',
        width: '90%',
        justifySelf: 'center',
        paddingTop: 4
      }}>
      <Typography
        variant="h4"
        fontWeight={'bold'}
        sx={{
          justifySelf: 'center',
          marginBottom: 2,
          padding: 1,
          borderRadius: 3,
          backgroundColor: 'primary.main'
        }}
      >
        {user ? 'All Rated Properties' : 'Login to View Rated Properties'}
      </Typography>
      {user && <MyGrid dataSource={dataSource} resultsPerPage={20} maxCacheSize={5} extraColumns={EXTRA_COLUMN} />}
    </Box>
  )
}