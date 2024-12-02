import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/monokai.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../Services/AuthContext";

// A reusable EditButton component
const EditButton = ({ onEdit }) => (
  <button className="btn btn-warning btn-sm ms-2" onClick={onEdit}>
    Edit
  </button>
);

const CodeBlock = ({ code }) => {
  useEffect(() => {
    hljs.highlightAll();
  }, [code]);

  return (
    <pre className="p-3 bg-dark text-light rounded">
      <code>{code || "No code snippet provided"}</code>{" "}
      {/* Default message when no code */}
    </pre>
  );
};

// A component to render comments with edit functionality
const Comments = ({ comments, userId, onEditComment }) => (
  <div className="mt-3">
    <h5 className="text-info">Comments</h5>
    {comments.length > 0 ? (
      <div className="list-group">
        {comments.map((comment) => (
          <div
            key={comment.comment_id}
            className="list-group-item list-group-item-light mb-2 rounded"
          >
            <p className="mb-0">{comment.body}</p>
            <p className="text-muted small">
              {comment.parent_type === "question" ? "On Question" : "On Answer"}
            </p>
            {userId === comment.user_id && (
              <EditButton onEdit={() => onEditComment(comment)} />
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted">No comments yet.</p>
    )}
  </div>
);

const QuestionDisplay = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedContent, setUpdatedContent] = useState({});
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
        console.log("Fetched question data:", data); // Log the full response to check
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
        ? { code: item.code || "", body: item.body } // Ensure code is part of updatedContent
        : { body: item.body }
    );
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const { type, item } = editingItem;
    let ID;

    if (type === "question") {
      ID = item.question_id;
      handleSaveQuestion(ID);
    } else if (type === "answer") {
      ID = item.answer_id;
      handleSaveAnswer(ID);
    } else if (type === "comment") {
      ID = item.comment_id;
      handleSaveComment(ID);
    }
  };

  const handleSaveQuestion = async (ID) => {
    if (!ID) return;

    try {
      const endpoint = `/api/updatequestion/${ID}`;
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedContent),
      });

      if (!response.ok) throw new Error("Failed to update question");

      setEditingItem(null);
      // Optionally refresh the data
      const refreshedResponse = await fetch(
        `http://localhost:5000/api/questions/${id}`
      );
      const refreshedData = await refreshedResponse.json();
      setQuestion(refreshedData);
    } catch (err) {
      console.error("Error while saving question:", err);
    }
  };

  const handleSaveAnswer = async (ID) => {
    if (!ID) return;

    try {
      const endpoint = `/api/updateanswer/${ID}`;
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedContent),
      });

      if (!response.ok) throw new Error("Failed to update answer");

      setEditingItem(null);
      // Optionally refresh the data
      const refreshedResponse = await fetch(
        `http://localhost:5000/api/questions/${id}`
      );
      const refreshedData = await refreshedResponse.json();
      setQuestion(refreshedData);
    } catch (err) {
      console.error("Error while saving answer:", err);
    }
  };

  const handleSaveComment = async (ID) => {
    if (!ID) return;

    try {
      const endpoint = `/api/updatecomment/${ID}`;
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedContent),
      });

      if (!response.ok) throw new Error("Failed to update comment");

      setEditingItem(null);
      // Optionally refresh the data
      const refreshedResponse = await fetch(
        `http://localhost:5000/api/questions/${id}`
      );
      const refreshedData = await refreshedResponse.json();
      setQuestion(refreshedData);
    } catch (err) {
      console.error("Error while saving comment:", err);
    }
  };

  if (loading) return <p>Loading question...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()}`;
  };

  return (
    <div className="container my-5">
      <div className="question bg-light p-4 rounded shadow-sm mb-4">
        <h1 className="text-primary border-bottom pb-2">
          {question.question.title}
        </h1>
        <CodeBlock
          code={question.question.code || "No code snippet provided"}
        />
        <p className="text-muted">{question.question.body}</p>
        <p className="small text-muted">Views: {question.question.views}</p>
        <p className="small text-muted">Upvotes: {question.question.upvotes}</p>

        {/* Display Created or Last Edited Timestamps */}
        <p>
          <strong>Created At:</strong>{" "}
          {formatTimestamp(question.question.created_at)}
        </p>
        {question.question.updated_at &&
          question.question.created_at !== question.question.updated_at && (
            <p>
              <strong>Last Edited At:</strong>{" "}
              {formatTimestamp(question.question.updated_at)}
            </p>
          )}

        {userId === question.question.user_id && (
          <EditButton
            onEdit={() => handleEdit("question", question.question)}
          />
        )}
      </div>
      <Comments
        comments={question.comments.filter((c) => c.parent_type === "question")}
        userId={userId}
        onEditComment={(comment) => handleEdit("comment", comment)}
      />
      <div className="answers bg-light p-4 rounded shadow-sm">
        <h2 className="text-success">Answers</h2>
        {question.answers.length > 0 ? (
          question.answers.map((answer) => (
            <div
              className="bg-white p-3 rounded shadow-sm mb-4"
              key={answer.answer_id}
            >
              <p className="lead text-dark">{answer.body}</p>
              <CodeBlock code={answer.code || "No code snippet provided"} />
              <p className="small text-muted">Upvotes: {answer.upvotes}</p>

              {/* Display Created or Last Edited Timestamps for Answer */}
              <p>
                <strong>Created At:</strong>{" "}
                {formatTimestamp(answer.created_at)}
              </p>
              {answer.updated_at && answer.created_at !== answer.updated_at && (
                <p>
                  <strong>Last Edited At:</strong>{" "}
                  {formatTimestamp(answer.updated_at)}
                </p>
              )}

              {userId === answer.user_id && (
                <EditButton onEdit={() => handleEdit("answer", answer)} />
              )}
              <Comments
                comments={question.comments.filter(
                  (comment) =>
                    comment.parent_type === "answer" &&
                    comment.parent_id === answer.answer_id
                )}
                userId={userId}
                onEditComment={(comment) => handleEdit("comment", comment)}
              />
            </div>
          ))
        ) : (
          <p className="text-muted">No answers yet.</p>
        )}
      </div>
      {editingItem && (
        <div className="edit-modal">
          {/* Check if it's a question or answer and include a code textarea */}
          {(editingItem.type === "question" ||
            editingItem.type === "answer") && (
            <>
              <textarea
                className="form-control mb-3"
                placeholder="Edit code"
                value={updatedContent.code || ""}
                onChange={(e) =>
                  setUpdatedContent((prev) => ({
                    ...prev,
                    code: e.target.value,
                  }))
                }
              />
            </>
          )}

          {/* Common textarea for editing body */}
          <textarea
            className="form-control mb-3"
            placeholder="Edit body"
            value={updatedContent.body || ""}
            onChange={(e) =>
              setUpdatedContent((prev) => ({ ...prev, body: e.target.value }))
            }
          />

          <button className="btn btn-primary me-2" onClick={handleSave}>
            Save
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setEditingItem(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
