
from rest_framework import serializers
from .models import App, Deployment

class AppSerializer(serializers.ModelSerializer):
    replicas = serializers.IntegerField(
        min_value=1,
        max_value=20,
    )
    port = serializers.IntegerField(
        min_value=1,
        max_value=65535,
    )

    class Meta:
        model = App

        fields = [
            "id",
            "name",
            "namespace",
            "image",
            "replicas",
            "port",
            "environment_variables",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


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
        ]
        read_only_fields = fields