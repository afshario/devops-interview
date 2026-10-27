from rest_framework import status as http_status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from models import App
from .serializers import (
    AppSerializer,
    AppStatusSerializer,
    AppDeleteSerializer,
)
from services import (
    delete_app,
    get_app_status,
    get_apps_status,
)


class AppViewSet(viewsets.ModelViewSet):
    queryset = App.objects.all()
    serializer_class = AppSerializer

    def destroy(self, request, *args, **kwargs):
        app = self.get_object()

        result = delete_app(app)
        output_serializer = AppDeleteSerializer(data=result)
        output_serializer.is_valid(raise_exception=True)

        return Response(
            output_serializer.data,
            status=http_status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        app = self.get_object()

        result = get_app_status(app)
        output_serializer = AppStatusSerializer(result)

        return Response(output_serializer.data)

    @action(detail=False,methods=["get"],url_path="status")
    def statuses(self, request):
        apps = self.get_queryset()

        results = get_apps_status(apps)
        output_serializer = AppStatusSerializer(
            results,
            many=True,
        )

        return Response({"results": output_serializer.data})