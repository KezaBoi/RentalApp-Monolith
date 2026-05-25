import { useEffect, useState } from 'react';
import { Link, replace, useNavigate, useSearchParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useAuth } from "../context/AuthContext";

function GetInputs({ mode }) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState(null);
  useEffect(() => {
    setStatus('idle');
    setErrMsg(null);
  }, [mode])


  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const [authData, setAuthData] = useState({ email: '', password: '' });
  const handleAuthChange = (info) => setAuthData({ ...authData, [info.target.name]: info.target.value });

  const handleSubmit = async () => {
    setStatus('pending');
    setErrMsg(null);
    const newUser = mode === 'register';
    try {
      setStatus('idle');
      // Automatically log user in if just registered to retrieve token
      await auth(newUser, authData);
      if (newUser) await auth(!newUser, authData);
      navigate('/', { replace: true });
    } catch (e) {
      setErrMsg(e.message);
      setStatus('error')
    }
  };

  return (
    <Stack direction={'column'} spacing={2} alignItems={'center'}>
      {status === 'error' &&
        <Alert severity='error'>{errMsg}</Alert>
      }

      <TextField
        label='Email'
        name='email'
        value={authData.email}
        onChange={handleAuthChange}
        sx={{ width: '100%', maxWidth: '250px' }}
      />
      <TextField
        label='Password'
        name='password'
        type={showPassword ? 'text' : 'password'}
        value={authData.password}
        onChange={handleAuthChange}
        sx={{ width: '100%', maxWidth: '250px' }}
        slotProps={{
          input: {
            endAdornment:
              <InputAdornment position='end'>
                <IconButton
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
          }
        }}
      />

      <Button onClick={handleSubmit} disabled={status === 'pending'}>
        {status === 'pending' ? <CircularProgress size={20} /> : 'Submit'}
      </Button>
    </Stack>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  
  const mode = searchParams.get('mode');
  return (
    <Box
      margin={4}
      padding={2}
      display={'flex'}
      bgcolor={'background.paper'}
      width={'20%'}
      minWidth={'300px'}
      justifySelf={'center'}
      alignSelf={'center'}
      borderRadius={3}
      justifyContent={'center'}
    >
      <Stack direction={'column'} alignItems={'center'}>

        <Typography variant={'h4'} align={'center'} fontWeight={'bold'} paddingBottom={1}>
          {mode === 'login' ? 'Login' : 'Register'}
        </Typography>

        <GetInputs mode={mode} />

        {mode === 'login' ?
          <Link to='/login?mode=register'><Button sx={{ margin: 2 }}>No account? Register here</Button></Link> :
          <Link to='/login?mode=login'><Button sx={{ margin: 2 }}>Have an account? Login here</Button></Link>
        }
      </Stack>
    </Box>
  );
};

