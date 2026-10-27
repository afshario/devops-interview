from rest_framework import status, mixins, viewsets
from rest_framework.response import Response

from models import Deployment
from serializers import (
    DeploymentSerializer,
    DeploymentCreateSerializer,
)
from services import create_deployment


class DeploymentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Deployment.objects.select_related("app")
    serializer_class = DeploymentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        app_id = self.request.query_params.get("app")

        if app_id:
            queryset = queryset.filter(app_id=app_id)

        return queryset

    def create(self, request, *args, **kwargs):
        input_serializer = DeploymentCreateSerializer(
            data=request.data
        )
        input_serializer.is_valid(raise_exception=True)

        app = input_serializer.validated_data["app"]

        deployment = create_deployment(app)

        output_serializer = self.get_serializer(deployment)

        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
        )