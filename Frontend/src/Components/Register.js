import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Make API request to register the user
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // On successful registration, navigate to login page
        navigate("/login");
      } else {
        setErrorMessage(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="bg-dark text-light p-4 rounded shadow-lg">
            <h2 className="text-center text-light">Register</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">Username:</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
                Register
              </button>
            </form>
            <div className="text-center">
              <button
                className="btn btn-link text-light"
                onClick={() => navigate("/login")}
              >
                Already have an account? Login
              </button>
            </div>
            {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
