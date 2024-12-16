import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // to get the user ID from URL
import { Link } from "react-router-dom"; // to link to individual question details

const UserQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get userId from the URL (assuming URL structure like /user/:userId/questions)
  const { userId } = useParams();

  useEffect(() => {
    const fetchUserQuestions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:5000/api/user/myquestions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setQuestions(data.questions);
        } else {
          setError(data.error || "An error occurred");
        }
      } catch (err) {
        setError("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    fetchUserQuestions();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="container my-5">
      <h1 className="text-light">Questions Asked by User {userId}</h1>
      {questions.length > 0 ? (
        questions.map((question) => (
          <div
            key={question.question_id}
            className="bg-dark text-light p-4 rounded shadow-sm mb-4"
          >
            <h2>
              <Link
                to={`/question/${question.question_id}`}
                className="text-light text-decoration-none"
              >
                {question.title}
              </Link>
            </h2>
            <p>{question.body}</p>
            <p className="text-muted">Asked by: {question.asked_by}</p>
            <p>
              <strong>Created At:</strong>{" "}
              {formatTimestamp(question.created_at)}
            </p>
            <p>
              <strong>Upvotes:</strong> {question.upvotes}
            </p>
          </div>
        ))
      ) : (
        <p className="text-light">No questions found for this user.</p>
      )}
    </div>
  );
};

export default UserQuestions;
