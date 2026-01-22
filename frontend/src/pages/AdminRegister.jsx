import { useState } from "react";
import { adminRegister } from "../services/apiClient";
import { useNavigate } from "react-router-dom";

export default function AdminRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await adminRegister({
        username,
        email,
        password,
        secret_key: secretKey,
      });

      alert("Admin created successfully");
      navigate("/auth/login");
    } catch (err) {
      setError(err.secret_key?.[0] || "Failed to create admin");
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="fw-bold mb-4 text-center">Admin Signup</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="form-control mb-3"
          placeholder="Admin Secret Key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          required
        />

        <button className="btn btn-danger w-100">Create Admin</button>
      </form>
    </div>
  );
}
