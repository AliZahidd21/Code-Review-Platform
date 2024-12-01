import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  const login = async (email, password) => {
    const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    const data = await response.json();
    if (data.token) {
        // Store the JWT token
        localStorage.setItem("authToken", data.token);  

        // Set the user data and token in the state
        setUser({ user_id: data.user.user_id, username: data.user.username, email: data.user.email });
        setToken(data.token);
    }
  };

  const logout = () => {
    // Clear user and token from the state and localStorage
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const isSignedIn = Boolean(user && token);

  return (
    <AuthContext.Provider value={{ user, token, isSignedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
