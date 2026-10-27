from packages.helm_manager import uninstall_app


def delete_app(app):
    result = uninstall_app(app)

    app.delete()

    return {
        "detail": "App deleted successfully.",
        "logs": result.get("logs", ""),
    }