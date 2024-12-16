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
      navigate("/");  // Redirect to the homepage (or any other page on success)
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    }
  };

  const handleNewUser = () => {
    navigate("/RegisterUser");  // Navigate to the RegisterUser page
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="bg-dark text-light p-4 rounded shadow-lg">
            <h2 className="text-center text-light">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline-light w-100 mb-3">
                Login
              </button>
            </form>
            <div className="text-center">
              <button
                className="btn btn-link text-light"
                onClick={handleNewUser}
              >
                Not Signed in Yet? Register here.
              </button>
            </div>
            {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
