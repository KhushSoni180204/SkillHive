import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    user_phone: "",
    user_role: "student",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        {
          username: formData.username,
          email: formData.email,
          user_phone: formData.user_phone,
          user_role: formData.user_role,
          password: formData.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      navigate("/auth/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data);

      const firstError = err.response?.data
        ? Object.values(err.response.data)[0]
        : "Registration failed";

      setError(
        Array.isArray(firstError) ? firstError[0] : firstError
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <h2 className="fw-bold mb-4 text-center">Create an Account</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            name="username"
            placeholder="Username"
            value={formData.username || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            className="form-control"
            name="user_phone"
            placeholder="Number"
            value={formData.user_phone || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            name="user_role"
            value={formData.user_role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="confirm_password"
            value={formData.confirm_password || ""}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <Link to="/auth/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
