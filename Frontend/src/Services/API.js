// api.js
//import axios from "axios";

//const BASE_URL = "http://localhost:5000";

const sampleUserData = {
  username: "user1",
  password: "password123",
  token: "sample-jwt-token-12345",
};
const sampleQuestions = [
  {
    id: 1,
    title: "How to use React?",
    content: "I am new to React, help me!",
    tags: ["react"],
  },
  {
    id: 2,
    title: "JavaScript error handling",
    content: "How to handle errors in JS?",
    tags: ["javascript"],
  },
  {
    id: 3,
    title: "CSS Grid vs Flexbox",
    content: "When should I use CSS Grid?",
    tags: ["css"],
  },
  {
    id: 4,
    title: "React state management",
    content: "What are the options?",
    tags: ["react", "state"],
  },
];

export const fetchQuestions = (search = "") => {
  return new Promise((resolve) => {
    if (search) {
      const filtered = sampleQuestions.filter(
        (q) =>
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.content.toLowerCase().includes(search.toLowerCase()) ||
          q.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
      resolve(filtered);
    } else {
      resolve(sampleQuestions);
    }
  });
};
