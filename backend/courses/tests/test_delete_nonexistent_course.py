def test_delete_nonexistent_course(api_client, instructor_user):
    api_client.force_authenticate(instructor_user)

    response = api_client.delete("/api/courses/999999/")
    assert response.status_code == 404