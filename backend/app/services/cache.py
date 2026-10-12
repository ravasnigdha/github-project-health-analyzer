import time
from typing import Dict, Any, Optional

class SimpleTTLCache:
    """Thread-safe in-memory cache with Time-To-Live (TTL)."""
    def __init__(self, default_ttl_seconds: int = 900):
        self._default_ttl = default_ttl_seconds
        self._storage: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._storage.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._storage[key]
            return None
        return entry["data"]

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        self._storage[key] = {
            "data": value,
            "expires_at": time.time() + ttl,
            "stored_at": time.time()
        }

    def delete(self, key: str) -> bool:
        if key in self._storage:
            del self._storage[key]
            return True
        return False

    def clear(self) -> None:
        self._storage.clear()

    def size(self) -> int:
        now = time.time()
        # Clean expired keys on size query
        expired = [k for k, v in self._storage.items() if now > v["expires_at"]]
        for k in expired:
            del self._storage[k]
        return len(self._storage)

# Global instance for app
analysis_cache = SimpleTTLCache(default_ttl_seconds=900)
