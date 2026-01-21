from google import genai
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    @classmethod
    def generate(cls, prompt: str) -> str:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )
        return response.text.strip()
