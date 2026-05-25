import Box from "@mui/material/Box";

export default function Footer() {
  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: 'secondary.main',
        padding: 2,
        marginTop: 'auto',
      }}
    >
      Radiant Rentals
      <br />
      Copyright &copy; 2026
    </Box>
  );
}