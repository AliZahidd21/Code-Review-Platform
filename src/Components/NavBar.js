import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../Services/AuthContext";

const Navbar = () => {
  const { isSignedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleAuthClick = () => {
    if (isSignedIn) {
      logout(); // Log the user out
      navigate("/"); // Redirect to home after logout
    } else {
      navigate("/login"); // Navigate to login page
    }
  };

  const handleProfileClick = () => {
    if (isSignedIn) {
      navigate("/profile"); // Navigate to profile page
    } else {
      navigate("/login"); // Navigate to login page if not signed in
    }
  };

  const handleSearch = () => {
    // Navigate to DisplayQuestions with the search query
    navigate(`/DisplayQuestions?search=${searchQuery}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Q&A App
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/displayQuestions">
                View Questions
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/submit">
                Submit a Question
              </Link>
            </li>
          </ul>
          {/*this is where the search bar should go*/}
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search Questions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query on change
            />
            <button
              className="btn btn-outline-light"
              onClick={handleSearch} // Trigger the search function
            >
              Search
            </button>
            {isSignedIn ? (
              <>
                <FaUserCircle
                  className="text-light fs-4 me-2"
                  onClick={handleProfileClick}
                />
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleAuthClick}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleAuthClick}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
