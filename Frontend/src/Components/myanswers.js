import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyAnsweredQuestions() {
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch answered questions when the component is mounted
  useEffect(() => {
    const fetchAnsweredQuestions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/my-answered-questions",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch answered questions");
        }
        const data = await response.json();
        setAnsweredQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnsweredQuestions();
  }, []);

  // Display the answered questions
  return (
    <div className="container my-5">
      <h1 className="text-light">Questions You've Answered</h1>
      {loading && <p className="text-light">Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {answeredQuestions.length === 0 && !loading && (
        <p className="text-light">You haven't answered any questions yet.</p>
      )}
      <div>
        {answeredQuestions.map((question) => (
          <div
            key={question.question_id}
            className="bg-dark text-light p-4 rounded shadow-sm mb-4"
          >
            <h3>{question.title}</h3>
            <p>{question.body}</p>
            <pre className="bg-dark text-light p-3 rounded">
              <code>{question.code || "No code provided"}</code>
            </pre>
            <p>
              <strong>Your Answer:</strong> {question.answer.body}
            </p>
            <p>
              <strong>Answered At:</strong>{" "}
              {new Date(question.answer.created_at).toLocaleString()}
            </p>
            <button
              className="btn btn-outline-light"
              onClick={() => navigate(`/question/${question.question_id}`)} // Navigate to the full question
            >
              View Question
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyAnsweredQuestions;
