import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: '#55bfd8' },
    secondary: { main: '#ce4f32' },
    background: {
      default: '#5f5f5f',
      paper: '#a8a8a8'
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial'
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      }
    }
  }
});

export default theme;