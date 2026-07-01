from dotenv import load_dotenv

load_dotenv()  # must run BEFORE importing app, so os.environ is populated

from app import create_app  # noqa: E402

app = create_app()

if __name__ == "__main__":
    app.run(port=8000, debug=True)