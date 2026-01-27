from google import genai
from django.conf import settings


class GeminiService:
    @classmethod
    def generate(cls, prompt: str) -> str:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )
        return response.text.strip()
