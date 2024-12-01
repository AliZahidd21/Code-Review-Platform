import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const QuestionsList = ({ search }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch data from the API
        const response = await fetch("http://localhost:5000/api/questions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();

        // Handle empty results
        if (data.questions && data.questions.length === 0) {
          setError("No questions found");
        } else {
          setQuestions(data.questions); // Use the "questions" key from the response
        }
      } catch (err) {
        setError(err.message || "Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    getQuestions();
  }, [search]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <ul>
          {questions.map((question) => (
            <li key={question.question_id}>
              <Link to={`/Question/${question.question_id}`}>
                {question.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionsList;
