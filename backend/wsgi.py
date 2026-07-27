from app import create_app
from app.config.env import get_config

app = create_app(get_config())
