import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function CodeBlock({ code }) {
    React.useEffect(() => {
        hljs.highlightAll();
    }, [code]);

    return (
        <pre className="p-3 bg-dark text-light rounded">
            <code>{code}</code>
        </pre>
    );
}

function Comments({ comments }) {
    return (
        <div className="mt-3">
            <h5 className="text-info">Comments</h5>
            {comments.length > 0 ? (
                <div className="list-group">
                    {comments.map((comment, index) => (
                        <div key={index} className="list-group-item list-group-item-light mb-2 rounded">
                            <p className="mb-0">{comment.text}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted">No comments yet.</p>
            )}
        </div>
    );
}

function App() {
    const [activeTab, setActiveTab] = useState('answer1');

    const question = {
        title: "How to create a simple JavaScript function?",
        description: "I am trying to understand the basics of JavaScript functions. Can someone provide an example?",
        codeSnippet: `function greet(name) { return "Hello, " + name; }`,
        comments: [
            { text: "This is a very good question!" },
            { text: "You can also use arrow functions here." },
        ],
    };

    const acceptedAnswers = [
        {
            id: 'answer1',
            code: `function greet() { console.log("Hello, world!"); } greet();`,
            description: 'This is the first accepted answer explaining the basics of functions.',
            comments: [
                { text: "This explanation helped me a lot!" },
                { text: "Good use of a simple example." },
            ],
        },
        {
            id: 'answer2',
            code: `const greet = (name) => { console.log("Hello, " + name); }; greet("Alice");`,
            description: 'This is another answer using an arrow function for greeting.',
            comments: [{ text: "I prefer this modern approach." }],
        },
    ];

    const otherAnswers = [
        {
            id: 'unaccepted1',
            code: `let greet = function(name) { return "Hi, " + name; }; console.log(greet("Bob"));`,
            description: 'This answer uses a function expression.',
            comments: [],
        },
        {
            id: 'unaccepted2',
            code: `function sayHi() { alert("Hi!"); } sayHi();`,
            description: 'A simpler answer using the alert function.',
            comments: [{ text: "This could use a bit more explanation." }],
        },
    ];

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

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

                <ul className="nav nav-tabs mt-3">
                    {acceptedAnswers.map((answer) => (
                        <li className="nav-item" key={answer.id}>
                            <button
                                className={`nav-link ${activeTab === answer.id ? 'active bg-success text-white' : ''}`}
                                onClick={() => handleTabChange(answer.id)}
                            >
                                {`Answer ${answer.id.slice(-1)}`}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="tab-content bg-secondary p-4 rounded shadow-sm mt-3">
                    {acceptedAnswers.map(
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
                {otherAnswers.map((answer) => (
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
}

export default App;
