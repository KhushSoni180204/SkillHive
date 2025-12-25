def test_student_enrolls(student_client, sample_course):
    res = student_client.post("/api/enrollments/", {
        "course": sample_course.id
    })
    
    assert res.status_code == 201
