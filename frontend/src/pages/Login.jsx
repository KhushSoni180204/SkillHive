import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/apiClient";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();

  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({
        email,   
        password,
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const decoded = jwtDecode(data.access);

      if (decoded.user_role === "instructor") {
        navigate("/dashboard/instructor");
      }else if(decoded.user_role === "admin"){
        navigate("/dashboard/admin");
      }else {
        navigate("/dashboard/student");
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Invalid username or password";
      setError(msg);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="fw-bold mb-4 text-center">Login</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100">
          Login
        </button>
        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <Link to="/auth/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
