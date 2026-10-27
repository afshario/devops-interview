from rest_framework import serializers
from models import App, Deployment


class DeploymentCreateSerializer(serializers.Serializer):
    app_id = serializers.PrimaryKeyRelatedField(
        queryset=App.objects.all(),
        source="app",
    )


class DeploymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deployment
        fields = [
            "id",
            "app",
            "status",
            "logs",
            "created_at",
            "finished_at",
            "helm_values",
        ]
        read_only_fields = fields