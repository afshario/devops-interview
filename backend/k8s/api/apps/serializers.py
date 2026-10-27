from rest_framework import serializers
from models import App


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


class AppStatusSerializer(serializers.Serializer):
    app_id = serializers.IntegerField()
    namespace = serializers.CharField(required=False)
    status = serializers.ChoiceField(
        choices=["running", "not-running"],
    )
    pod_count = serializers.IntegerField(min_value=0)


class AppDeleteSerializer(serializers.Serializer):
    detail = serializers.CharField()
    logs = serializers.CharField(allow_blank=True)