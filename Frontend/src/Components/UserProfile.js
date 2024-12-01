import React, { useEffect, useState } from "react";

const UserInfo = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Assuming the token is stored in localStorage after login
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` // Send token in the Authorization header
                    }
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

    if (loading) return <p>Loading user info...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container my-5">
            {userInfo ? (
                <div className="user-info bg-light p-4 rounded shadow-sm">
                    <h2 className="text-primary">{userInfo.username}</h2>
                    <p>Email: {userInfo.email}</p>
                    <p>Account Created: {userInfo.created_at}</p>
                </div>
            ) : (
                <p>User not found.</p>
            )}
        </div>
    );
};

export default UserInfo;
