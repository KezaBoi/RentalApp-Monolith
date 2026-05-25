import Nav from "./Nav";
import logo from "../assets/icon.svg";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';

export default function Header() {
  return (
    <Box component='header'>
      <AppBar position='fixed'>
        <Toolbar>
          <Box
            component={'img'}
            alt='Radiant Rentals Logo'
            src={logo}
            sx={{
              height: 50,
              width: 'auto',
              paddingLeft: 2,
              alignSelf: 'center'
            }}
          />

          <Typography
            color='black'
            variant='h1'
            fontWeight='bold'
            fontFamily='math'
            sx={{
              flexGrow: 1,
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              alignContent: 'center',
              paddingLeft: 2,
              paddingTop: 1
            }}
          >
            Radiant Rentals
          </Typography>

          <Nav />
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
}