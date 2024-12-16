import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../Services/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const { isSignedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Handles authentication logic (sign in or sign out)
  const handleAuthClick = () => {
    if (isSignedIn) {
      logout();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  // Navigates to the user's profile
  const handleProfileClick = () => {
    if (isSignedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  // Handles search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/DisplayQuestions?search=${searchQuery}`);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand text-light" to="/">
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
              <Link className="nav-link text-light" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light" to="/displayQuestions">
                View Questions
              </Link>
            </li>
            {isSignedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-light" to="/submit">
                    Submit a Question
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-light" to="/myquestions">
                    My Questions
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center">
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
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleAuthClick}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
