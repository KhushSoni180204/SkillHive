def test_instructor_creates_course(instructor_client):
    res = instructor_client.post("/api/courses/", {
        "course_name": "Python",
        "description": "Backend Course"
    })

    assert res.status_code == 201
