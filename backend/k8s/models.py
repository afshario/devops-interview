from django.db import models

class App(models.Model):
    name = models.CharField(max_length=255)
    namespace = models.CharField(max_length=255, default='default')
    image = models.CharField(max_length=500)
    replicas = models.IntegerField(default=1)
    port = models.IntegerField()
    environment_variables = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Deployment(models.Model):
    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        IN_PROGRESS = "in-progress", "In Progress"

    app = models.ForeignKey(
        App,
        on_delete=models.CASCADE,
        related_name="deployments",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
    )
    logs = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    helm_values = models.JSONField(default=dict, blank=True)