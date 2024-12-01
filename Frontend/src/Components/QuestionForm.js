import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function QuestionForm() {
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Question submitted (This is a static form, no backend interaction).");
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm p-4 rounded">
                <h2 className="text-primary mb-4">Submit a Question</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="question" className="form-label">Question Title</label>
                        <input
                            type="text"
                            id="question"
                            className="form-control"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your question title"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                            id="description"
                            className="form-control"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide details or context for your question"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="codeSnippet" className="form-label">Code Snippet (optional)</label>
                        <textarea
                            id="codeSnippet"
                            className="form-control"
                            rows="4"
                            value={codeSnippet}
                            onChange={(e) => setCodeSnippet(e.target.value)}
                            placeholder="If applicable, share your code snippet"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Submit Question</button>
                </form>
            </div>
        </div>
    );
}

export default QuestionForm;
