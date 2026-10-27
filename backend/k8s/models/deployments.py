from django.db import models

class Status(models.TextChoices):
      SUCCESS = "success", "Success"
      FAILED = "failed", "Failed"
      IN_PROGRESS = "in-progress", "In Progress"


class Deployment(models.Model):

      app = models.ForeignKey(
            "App",
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