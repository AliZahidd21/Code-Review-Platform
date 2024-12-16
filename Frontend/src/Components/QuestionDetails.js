import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/monokai.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../Services/AuthContext";

const QuestionDisplay = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedContent, setUpdatedContent] = useState({});
  const [answerBody, setAnswerBody] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          "http://localhost:5000/api/getuseridfromtoken",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setUserId(data.id);
      } catch (err) {
        console.error("Failed to fetch user ID:", err);
      }
    };

    if (isSignedIn) {
      fetchUserId();
    }
  }, [isSignedIn]);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/questions/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch question data");
        const data = await response.json();
        setQuestion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [id]);

  const handleEdit = (type, item) => {
    setEditingItem({ type, item });
    setUpdatedContent(
      item.body
        ? { code: item.code || "", body: item.body }
        : { body: item.body }
    );
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const { type, item } = editingItem;
    let endpoint;

    if (type === "question") {
      endpoint = `/api/updatequestion/${item.question_id}`;
    } else if (type === "answer") {
      endpoint = `/api/updateanswer/${item.answer_id}`;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedContent),
      });

      if (!response.ok) throw new Error(`Failed to update ${type}`);

      setEditingItem(null);
      // Refresh data
      const refreshedResponse = await fetch(
        `http://localhost:5000/api/questions/${id}`
      );
      const refreshedData = await refreshedResponse.json();
      setQuestion(refreshedData);
    } catch (err) {
      console.error(`Error while saving ${type}:`, err);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert("You must be signed in to submit an answer.");
      return;
    }

    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`http://localhost:5000/api/${id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: answerBody, code: answerCode }),
      });

      if (!response.ok) throw new Error("Failed to submit answer");

      const newAnswer = await response.json();
      setQuestion((prev) => ({
        ...prev,
        answers: [...prev.answers, newAnswer],
      }));
      setAnswerBody("");
      setAnswerCode("");
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  if (loading) return <p>Loading question...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="container my-5">
      {/* Question Section */}
      <div className="bg-dark text-light p-4 rounded shadow-sm mb-4"
           style={{ border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
        <h1>{question.question.title}</h1>
        <p>{question.question.body}</p>
        <pre className="bg-dark text-light p-3 rounded">
          <code>{question.question.code || "No code snippet provided"}</code>
        </pre>
        <p className="text-muted">Username: {question.question.asked_by}</p>{" "}
        <p>
          <strong>Created At:</strong>{" "}
          {formatTimestamp(question.question.created_at)}
        </p>
        {userId === question.question.user_id && (
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit("question", question.question)}
          >
            Edit
          </button>
        )}
      </div>

      {/* Answers Section */}
      <div className="bg-dark text-light p-4 rounded shadow-sm mb-4"
           style={{ border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
        <h2 className="text-success">Answers</h2>
        {question.answers.map((answer) => (
          <div
            className="bg-dark text-light p-3 rounded shadow-sm mb-4"
            key={answer.answer_id}
            style={{ border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}
          >
            <p>{answer.body}</p>
            <pre className="bg-dark text-light p-3 rounded">
              <code>{answer.code || "No code snippet provided"}</code>
            </pre>
            <p className="text-muted">Username: {answer.asked_by}</p>{" "}
            <p>
              <strong>Created At:</strong> {formatTimestamp(answer.created_at)}
            </p>
            {userId === answer.user_id && (
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit("answer", answer)}
              >
                Edit
              </button>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmitAnswer}>
          <textarea
            className="form-control mb-2"
            placeholder="Write your answer..."
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            required
          />
          <textarea
            className="form-control mb-2"
            placeholder="Add optional code..."
            value={answerCode}
            onChange={(e) => setAnswerCode(e.target.value)}
          />
          <button type="submit" className="btn btn-info">
            Submit Answer
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDisplay;
