import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../Services/AuthContext";
import { Link } from "react-router-dom";

function QuestionForm() {
  const token = localStorage.getItem("authToken");
  const { isSignedIn } = useAuth(); // Assuming your AuthContext provides the token
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null);
    setSuccess(false);

    try {
      // Prepare the data to send
      const requestData = {
        title: question,
        description: description,
        code: codeSnippet,
      };

      // Send the POST request to the backend
      const response = await fetch("http://localhost:5000/api/uploadquestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in the Authorization header
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit the question. Please try again.");
      }

      // If successful
      setSuccess(true);
      setQuestion("");
      setDescription("");
      setCodeSnippet("");
    } catch (err) {
      setError(err.message);
    }
  };

  return isSignedIn ? (
    <div className="container mt-5">
      <div className="card bg-dark text-light shadow-sm p-4 rounded">
        <h2 className="text-primary mb-4">Submit a Question</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="question" className="form-label">
              Question Title
            </label>
            <input
              type="text"
              id="question"
              className="form-control"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question title"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details or context for your question"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="codeSnippet" className="form-label">
              Code Snippet (optional)
            </label>
            <textarea
              id="codeSnippet"
              className="form-control"
              rows="4"
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="If applicable, share your code snippet"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit Question
          </button>
        </form>

        {success && (
          <p className="text-success mt-3">
            Your question has been successfully submitted!
          </p>
        )}
        {error && <p className="text-danger mt-3">{error}</p>}
      </div>
    </div>
  ) : (
    <Link to={"/Login"}>
      <p className="text-light">Sign in to upload a question</p>
    </Link>
  );
}

export default QuestionForm;
