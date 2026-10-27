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