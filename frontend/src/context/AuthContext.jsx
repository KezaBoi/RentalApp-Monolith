import { useState, createContext, useContext, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import { postAuth } from "../services/api";

const AuthContext = createContext();


export function AuthProvider({ children }) {
  
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user'));
  });
  
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
  }

  // Log user out if token expired
  useEffect(() => {
    if (user?.token) {
      const decodedToken = jwtDecode(user.token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        logoutUser();
      } else {
        const timeUntilExpiry = (decodedToken.exp - currentTime) * 1000;
        const timeout = setTimeout(logoutUser, timeUntilExpiry);
        return () => clearTimeout(timeout);
      }
    }
  }, [user]);

  const auth = async (newUser, credentials) => {
    try {
      const data = await postAuth(newUser, credentials);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (e) {
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, auth, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);