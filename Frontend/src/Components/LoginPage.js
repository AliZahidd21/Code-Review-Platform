import React, { useState } from "react";
import { useAuth } from "../Services/AuthContext";
import { useNavigate } from "react-router-dom";  // Import useNavigate hook

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();  // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");  // Redirect to the dashboard (or any other page on success)
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    }
  };

  const handleNewUser = () => {
    navigate("/RegisterUser");  // Navigate to the RegisterUser page
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <button onClick={handleNewUser}>Not Signed in Yet</button>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default LoginPage;
