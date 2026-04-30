from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from config import settings

# instead of authlib.jose
from joserfc.errors import JoseError
from joserfc import jwt
from joserfc.jwk import OctKey


def create_access_token(data: dict):
    key = OctKey.import_key(settings.SECRET_KEY)
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRY_MINUTES
    )
    payload = data.copy()
    payload.update({"exp": int(expire.timestamp())})  # joserfc int chahta hai
    header = {"alg": settings.ALGORITHM}
    token = jwt.encode(header, payload, key)
    return token  # already str, .decode() nahi lagega


def verify_token(token: str):
    try:
        key = OctKey.import_key(settings.SECRET_KEY)
        claims_requests = jwt.JWTClaimsRegistry(exp={"essential": True})
        decoded = jwt.decode(token, key)
        claims_requests.validate(decoded.claims)
        username = decoded.claims.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="token is missing")
        return username
    except JoseError:
        raise HTTPException(status_code=401, detail="couldn't validate credentials")
