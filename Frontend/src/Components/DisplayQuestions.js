import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DisplayQuestions = ({ search }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
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
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message || "Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [search]);

  return (
    <div className="container my-4">
      <h2 className="text-light text-center mb-4">Questions</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-light" role="status"></div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && questions.length === 0 && (
        <div className="alert alert-warning">No questions found.</div>
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="row">
          {questions.map((question) => (
            <div className="col-md-6 col-lg-4 mb-4" key={question.question_id}>
              <div className="card bg-dark border-light h-100">
                <div className="card-body">
                  <h5 className="card-title text-warning">{question.title}</h5>
                  <p className="card-text text-light">
                    {question.body?.slice(0, 100) || "No description available..."}...
                  </p>
                  <Link
                    to={`/Question/${question.question_id}`}
                    className="btn btn-outline-light btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayQuestions;
