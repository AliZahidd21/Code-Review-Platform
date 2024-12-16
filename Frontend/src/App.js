import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Services/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import DisplayQuestions from "./Components/DisplayQuestions";
import QuestionDetails from "./Components/QuestionDetails";
import QuestionForm from "./Components/QuestionForm";
import LoginPage from "./Components/LoginPage";
import Navbar from "./Components/NavBar";
import Profile from "./Components/UserProfile";
import Register from "./Components/Register";
import MyQuestions from "./Components/myquestions";
import MyAnswers from "./Components/myanswers";

function App() {
  const HomePage = () => (
    <div className="container text-center my-5 text-light bg-dark rounded">
      <div className="p-5">
        <h1 className="display-4">Welcome to CodoOptimize</h1>
        <p className="lead">
          A platform to collaborate and improve code quality with fellow developers.
        </p>
        <hr className="my-4 border-light" />
        <p>Join discussions, ask questions, and share your expertise today!</p>
        <a className="btn btn-primary btn-lg" href="/RegisterUser" role="button">
          Get Started
        </a>
      </div>
    </div>
  );

  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/RegisterUser" element={<Register />} />
          <Route path="/myanswers" element={<MyAnswers />} />
          <Route path="/myquestions" element={<MyQuestions />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/submit" element={<QuestionForm />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/DisplayQuestions" element={<DisplayQuestions />} />
          <Route path="/Question/:id" element={<QuestionDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
