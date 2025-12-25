import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function TopNav() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  let userRole = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.user_role;
    } catch {
      userRole = null;
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/auth/login");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold" to="/">
          SkillHive
        </Link>

        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/courses">
                Courses
              </Link>
            </li>

            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary" to="/auth/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to={
                      userRole === "instructor"
                      ? "/dashboard/instructor"
                      : userRole === "admin"
                      ? "/dashboard/admin"
                      : "/dashboard/student"
                    }
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
