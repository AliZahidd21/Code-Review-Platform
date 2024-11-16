import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QuestionDisplayApp from "./components/QuestionDisplay/QuestionDisplayApp";
import QuestionFormApp from "./components/QuestionForm/QuestionFormApp";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    return (
        <Router>
        <div className="container mt-4">
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 rounded shadow">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">Q&A App</Link>
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
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link active fw-semibold" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/display">View Questions</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold" to="/submit">Submit Question</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="card shadow-lg p-4 bg-light rounded">
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <div className="text-center">
                                <h1 className="text-primary">Welcome to the Q&A App</h1>
                                <p className="lead text-secondary">
                                    Your platform for sharing knowledge and solving problems!
                                </p>
                            </div>
                        } 
                    />
                    <Route path="/display" element={<QuestionDisplayApp />} />
                    <Route path="/submit" element={<QuestionFormApp />} />
                </Routes>
            </div>
        </div>
    </Router>
    );
}

export default App;
