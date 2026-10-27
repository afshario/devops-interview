from django.utils import timezone
from models import Deployment, Status
from packages.helm_manager import build_values_file, deploy_app


def create_deployment(app):
    deployment = Deployment.objects.create(
        app=app,
        status=Status.IN_PROGRESS,
    )

    try:
        file_name, helm_values = build_values_file(app)
        result = deploy_app(app, file_name)

        deployment.helm_values = helm_values
        deployment.logs = result.get("logs", "")

        deployment.status = (
            Status.SUCCESS
            if result.get("success")
            else Status.FAILED
        )

    except Exception as exc:
        deployment.status = Status.FAILED
        deployment.logs = (
            f"Deployment failed: {type(exc).__name__}: {exc}"
        )

    finally:
        deployment.finished_at = timezone.now()

        deployment.save(
            update_fields=[
                "status",
                "logs",
                "finished_at",
                "helm_values",
            ]
        )

    return deployment