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

          <div>
            <strong>Role</strong>
            <span className="badge bg-primary ms-2">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
