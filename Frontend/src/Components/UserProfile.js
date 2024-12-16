import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Send token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token]);

  // Format the date to a more readable format (e.g., MM/DD/YYYY)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) return <div className="d-flex justify-content-center"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <p className="text-danger font-weight-bold">{error}</p>;

  return (
    <div className="container my-5">
      {userInfo ? (
        <div className="user-info bg-dark p-4 rounded shadow-sm">
          <h2 className="text-light">{userInfo.username}</h2>
          <p className="text-light">Email: {userInfo.email}</p>
          <p className="text-light">Account Created: {formatDate(userInfo.created_at)}</p>
        </div>
      ) : (
        <p className="text-danger font-weight-bold">User not found.</p>
      )}
    </div>
  );
};

export default UserInfo;
