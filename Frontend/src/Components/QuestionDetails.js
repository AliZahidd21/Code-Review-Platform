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
                        <p className="mb-0">{comment.text}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-muted">No comments yet.</p>
        )}
    </div>
);

const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
    <ul className="nav nav-tabs mt-3">
        {tabs.map((tab) => (
            <li className="nav-item" key={tab.id}>
                <button
                    className={`nav-link ${activeTab === tab.id ? "active bg-success text-white" : ""}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {`Answer ${tab.id.slice(-1)}`}
                </button>
            </li>
        ))}
    </ul>
);

const QuestionDisplay = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchQuestionData = async () => {
            setLoading(true);
            setError(null);
            try {
                const mockQuestion = {
                    title: "How to create a simple JavaScript function?",
                    description:
                        "I am trying to understand the basics of JavaScript functions. Can someone provide an example?",
                    codeSnippet: `function greet(name) { return "Hello, " + name; }`,
                    comments: [
                        { text: "This is a very good question!" },
                        { text: "You can also use arrow functions here." },
                    ],
                    acceptedAnswers: [
                        {
                            id: "answer1",
                            code: `function greet() { console.log("Hello, world!"); } greet();`,
                            description:
                                "This is the first accepted answer explaining the basics of functions.",
                            comments: [
                                { text: "This explanation helped me a lot!" },
                                { text: "Good use of a simple example." },
                            ],
                        },
                        {
                            id: "answer2",
                            code: `const greet = (name) => { console.log("Hello, " + name); }; greet("Alice");`,
                            description:
                                "This is another answer using an arrow function for greeting.",
                            comments: [{ text: "I prefer this modern approach." }],
                        },
                    ],
                    otherAnswers: [
                        {
                            id: "unaccepted1",
                            code: `let greet = function(name) { return "Hi, " + name; }; console.log(greet("Bob"));`,
                            description: "This answer uses a function expression.",
                            comments: [],
                        },
                        {
                            id: "unaccepted2",
                            code: `function sayHi() { alert("Hi!"); } sayHi();`,
                            description: "A simpler answer using the alert function.",
                            comments: [{ text: "This could use a bit more explanation." }],
                        },
                    ],
                };
                setTimeout(() => {
                    setQuestion(mockQuestion);
                    setActiveTab(mockQuestion.acceptedAnswers[0].id);
                    setLoading(false);
                }, 1000);
            } catch (err) {
                setError("Failed to load question data.");
                setLoading(false);
            }
        };

        fetchQuestionData();
    }, [id]);

    const handleTabChange = (tabId) => setActiveTab(tabId);

    if (loading) return <p>Loading question...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container my-5">
            <div className="question bg-light p-4 rounded shadow-sm mb-4">
                <h1 className="text-primary border-bottom pb-2">{question.title}</h1>
                <p className="text-muted">{question.description}</p>
                <CodeBlock code={question.codeSnippet} />
                <Comments comments={question.comments} />
            </div>

            <div className="question bg-light p-4 rounded shadow-sm mb-4">
                <h2 className="text-success">Accepted Answers</h2>
                <TabNavigation
                    tabs={question.acceptedAnswers}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
                <div className="tab-content bg-secondary p-4 rounded shadow-sm mt-3">
                    {question.acceptedAnswers.map(
                        (answer) =>
                            activeTab === answer.id && (
                                <div key={answer.id}>
                                    <div className="row">
                                        <div className="col">
                                            <CodeBlock code={answer.code} />
                                        </div>
                                        <div className="col">
                                            <p className="lead text-white">{answer.description}</p>
                                        </div>
                                    </div>
                                    <Comments comments={answer.comments} />
                                </div>
                            )
                    )}
                </div>
            </div>

            <div className="question bg-light p-4 rounded shadow-sm">
                <h2 className="text-warning">Other Answers</h2>
                {question.otherAnswers.map((answer) => (
                    <div className="bg-light p-3 rounded shadow-sm mb-3" key={answer.id}>
                        <div className="row">
                            <div className="col">
                                <CodeBlock code={answer.code} />
                            </div>
                            <div className="col">
                                <p className="lead">{answer.description}</p>
                            </div>
                        </div>
                        <Comments comments={answer.comments} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionDisplay;
