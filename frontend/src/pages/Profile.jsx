import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      setUser({
        username: decoded.username,
        email: decoded.email,
        role: decoded.user_role,
      });
    } catch {
      // token issues handled by PrivateRoute
    }
  }, []);

  if (!user) {
    return <p className="text-center mt-5">Loading profile...</p>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <h2 className="fw-bold mb-4">My Profile</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <strong>Username</strong>
            <p className="mb-0">{user.username}</p>
          </div>
          <div className="mb-3">
            <strong>Email</strong>
            <p className="mb-0">{user.email}</p>
          </div>

          <div className="mb-3">
            <strong>Role</strong>
            <p className="mb-0">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
