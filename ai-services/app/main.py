from fastapi import FastAPI

app = FastAPI(title="FA AI Service", version="0.0.0")


@app.get("/health")
def health():
    return {"ok": True}
