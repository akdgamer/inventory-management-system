# config.py
import os
from datetime import timedelta

# Token expiration settings
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 24))
# Secret key for signing tokens (override via env var in production!)
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
# Signing algorithm
ALGORITHM = "HS256"
