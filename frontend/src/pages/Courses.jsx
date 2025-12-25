import { useEffect, useState } from "react";
import CourseCard from "../components/common/CourseCard";
import { getCourses } from "../services/apiClient"; // adjust path if needed

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return <p className="text-center mt-5">Loading courses...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-5">{error}</p>;
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4 text-center">Available Courses</h2>

      <div className="row">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.course_name}
            description={course.description}
          />
        ))}
      </div>
    </div>
  );
}
