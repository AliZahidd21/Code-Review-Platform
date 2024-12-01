import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/monokai.css";
import "bootstrap/dist/css/bootstrap.min.css";

const CodeBlock = ({ code }) => {
    useEffect(() => {
        hljs.highlightAll();
    }, [code]);

    return (
        <pre className="p-3 bg-dark text-light rounded">
            <code>{code}</code>
        </pre>
    );
};

const Comments = ({ comments }) => (
    <div className="mt-3">
        <h5 className="text-info">Comments</h5>
        {comments.length > 0 ? (
            <div className="list-group">
                {comments.map((comment, index) => (
                    <div
                        key={index}
                        className="list-group-item list-group-item-light mb-2 rounded"
                    >
                        <p className="mb-0">{comment.body}</p>
                        <p className="text-muted small">
                            {comment.parent_type === "question" ? "On Question" : "On Answer"}
                        </p>
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

    useEffect(() => {
        const fetchQuestionData = async () => {
          console.log(`Fetching question with id: ${id}`); // Log the id to ensure it's correct
          try {
            const response = await fetch(`http://localhost:5000/api/questions/${id}`);
            if (!response.ok) {
              throw new Error("Failed to fetch question data");
            }
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
      

    if (loading) return <p>Loading question...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container my-5">
            <div className="question bg-light p-4 rounded shadow-sm mb-4">
                <h1 className="text-primary border-bottom pb-2">{question.question.title}</h1>
                <p className="text-muted">{question.question.body}</p>
                <p className="small text-muted">Views: {question.question.views}</p>
                <p className="small text-muted">Upvotes: {question.question.upvotes}</p>
            </div>
            <Comments
                comments={question.comments.filter((comment) => comment.parent_type === "question")}
            />
            <div className="answers bg-light p-4 rounded shadow-sm">
                <h2 className="text-success">Answers</h2>
                {question.answers.length > 0 ? (
                    question.answers.map((answer) => (
                        <div className="bg-white p-3 rounded shadow-sm mb-4" key={answer.answer_id}>
                            <p className="lead text-dark">{answer.body}</p>
                            <CodeBlock code={answer.code || "No code snippet provided"} />
                            <p className="small text-muted">Upvotes: {answer.upvotes}</p>

                            {/* Comments on Answer */}
                            <Comments
                                comments={question.comments.filter(
                                    (comment) =>
                                        comment.parent_type === "answer" &&
                                        comment.parent_id === answer.answer_id
                                )}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-muted">No answers yet.</p>
                )}
            </div>
        </div>
    );
};

export default QuestionDisplay;
