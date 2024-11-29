import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchQuestions } from "../Services/API";

const DisplayQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const query = params.get("search"); // Get the search query

    const getQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchQuestions(query); // Use simulated backend
        if (data.length === 0) {
          setError("No questions found");
        } else {
          setQuestions(data);
        }
      } catch (err) {
        setError("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    getQuestions();
  }, [search]);

  return (
    <div>
      <h1>Questions</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && questions.length > 0 && (
        <ul>
          {questions.map((q) => (
            <Link to={`/Question/${q.id}`}>
              <li key={q.id}>
                <h3>{q.title}</h3>
                <p>{q.content}</p>
                <p>
                  <strong>Tags:</strong> {q.tags.join(", ")}
                </p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DisplayQuestions;
