"""In-memory content store (id -> { text, filename })."""

_store: dict[str, dict] = {}


class ContentStore:
    def get(self, id: str) -> dict | None:
        return _store.get(id)

    def set(self, id: str, data: dict) -> None:
        _store[id] = data

    def clear(self) -> None:
        _store.clear()


content_store = ContentStore()
