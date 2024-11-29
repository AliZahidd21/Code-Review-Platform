import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext); // Expose the context
};

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsSignedIn(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      // Authentication logic here
      const token = "mocked-token"; // Replace with actual API call in future
      localStorage.setItem("authToken", token);
      setIsSignedIn(true);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsSignedIn(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
