def success_response(data: dict | list | str | int | float | bool | None = None, message: str = "OK") -> dict:
    return {"success": True, "message": message, "data": data}
