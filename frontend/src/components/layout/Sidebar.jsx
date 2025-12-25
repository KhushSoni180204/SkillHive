import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  if (!token) return null;

  const decoded = jwtDecode(token);
  const role = decoded.user_role;
  
  function handleDashboardClick(){
    if(role === "admin"){
      navigate("/dashboard/admin");
    }else if(role === "instructor"){
      navigate("/dashboard/instructor");
    }else{
      navigate("/dashboard/student");
    }
  }

  return (
    <div
      className="d-none d-md-block bg-light border-end"
      style={{ width: "240px", minHeight: "100vh" }}
    >
      <div className="p-3" onClick={handleDashboardClick}>
        <h5 className="fw-bold" >Dashboard</h5>
        <small className="text-muted text-capitalize">{role}</small>
      </div>

      <ul className="list-group list-group-flush">

        {/* COMMON LINKS */}
        <li className="list-group-item">
          <Link
            to="/profile"
            className="text-decoration-none"
          >
            Profile
          </Link>
        </li>

        {/* STUDENT LINKS */}
        {role === "student" && (
          <>
            <li className="list-group-item">
              <Link
                to="/dashboard/student"
                className="text-decoration-none"
              >
                My Courses
              </Link>
            </li>
          </>
        )}

        {/* INSTRUCTOR LINKS */}
        {role === "instructor" && (
          <>
            <li className="list-group-item">
              <Link
                to="/dashboard/instructor"
                className="text-decoration-none"
              >
                My Courses
              </Link>
            </li>
          </>
        )}

        {/* ADMIN LINKS */}
        {role === "admin" && (
          <>
            <li className="list-group-item">
              <Link
                to="/dashboard/admin/analytics"
                className="text-decoration-none"
              >
                Admin Analysis
              </Link>
            </li>
          </>
        )}

      </ul>
    </div>
  );
}
