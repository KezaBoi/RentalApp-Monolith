import { Box, IconButton, Slide, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PropertyCard from "./PropertyCard";

// Implementation based on Medium article by Ltomblock
// https://medium.com/@ltomblock/crafting-a-professional-looking-carousel-with-react-and-mui-746a86af0ab0

export default function Carousel({ items }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState(null);

  const isXL = useMediaQuery(theme.breakpoints.up(1650))
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const cardsPerPage = isXL ? 3 : isLarge ? 2 : 1;


  const handleNextPage = () => {
    setSlideDirection("left");
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setSlideDirection("right");
    setPage((prevPage) => prevPage - 1);
  };

  return (
    <Box
      sx={{
        justifySelf: 'center',
        paddingY: 4,
        backgroundColor: 'background.paper',
        width: '70%',
        margin: 4,
        borderRadius: 6
      }}
    >
      <Typography
        variant="h4"
        sx={{
          justifySelf: 'center',
          fontWeight: 'bold',
          marginBottom: 2
        }}
      >
        Featured Properties
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <IconButton
          onClick={handlePrevPage}
          sx={{ margin: 5 }}
          disabled={page === 0}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            backgroundColor: 'secondary.main',
            paddingY: 4,
            borderRadius: 6,
            boxShadow: 3,
            width: '80%'
          }}
        >
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                width: '100%',
                height: '100%',
                display: page === index ? 'block' : 'none'
              }}
            >
              <Slide direction={slideDirection} in={page === index}>
                <Stack
                  spacing={4}
                  direction={'row'}
                  alignContent={'center'}
                  justifyContent={'center'}
                  sx={{
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {items
                    .slice(
                      index * cardsPerPage,
                      index * cardsPerPage + cardsPerPage
                    )
                    .map((item) => (
                      <Box key={item.id}>
                        <PropertyCard property={item} />
                      </Box>
                    ))}
                </Stack>
              </Slide>
            </Box>
          ))}
        </Box>
        <IconButton
          onClick={handleNextPage}
          sx={{
            margin: 5,
          }}
          disabled={
            page >= Math.ceil((items.length || 0) / cardsPerPage) - 1
          }
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  )
}