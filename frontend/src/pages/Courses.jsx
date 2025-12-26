import { useEffect, useState } from "react";
import CourseCard from "../components/common/CourseCard";
import { getCourses, searchCourses } from "../services/apiClient";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState(""); 
  const [searchQuery, setSearchQuery] = useState(""); 

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");

      try {
        let data;

        if (searchQuery.trim() === "") {
          data = await getCourses(); 
        } else {
          data = await searchCourses(searchQuery); 
        }

        setCourses(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [searchQuery]); 

  // Search trigger
  function handleSearch(e) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4 text-center">Available Courses</h2>

      {/* SEARCH BAR */}
      <form
        className="d-flex gap-2 mb-4"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search courses..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {/* STATES */}
      {loading && (
        <p className="text-center mt-4">Loading courses...</p>
      )}

      {error && (
        <p className="text-center text-danger mt-4">{error}</p>
      )}

      {/* COURSES */}
      <div className="row">
        {!loading && courses.length === 0 ? (
          <p className="text-center text-muted">
            No courses found.
          </p>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.course_name}
              description={course.description}
            />
          ))
        )}
      </div>
    </div>
  );
}
