import os

import uvicorn
from dotenv import load_dotenv

_ = load_dotenv()

if __name__ == "__main__":
    uvicorn.run(
        app="app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("AI_ASSIST_API_PORT", 8080)),
        reload=True,
    )
