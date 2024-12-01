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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<p>Home Page</p>} />
          <Route path="/RegisterUser" element={<Register />} />
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
