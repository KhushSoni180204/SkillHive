def test_create_course_missing_field(api_client, instructor_user):
    api_client.force_authenticate(instructor_user)
    
    response = api_client.post("/api/courses/", {"course_name": ""})
    assert response.status_code == 400