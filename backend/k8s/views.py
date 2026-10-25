from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import App, Deployment
from .serializers import (
    AppSerializer,
    DeploymentSerializer,
    DeploymentCreateSerializer,
)
from .services.helm_manager import build_values, deploy_app, uninstall_app
from .services.kubernetes_manager import get_kubernetes_client


class AppViewSet(viewsets.ModelViewSet):
    queryset = App.objects.all()
    serializer_class = AppSerializer


    def destroy(self, request, *args, **kwargs):
        app = self.get_object()
        result = uninstall_app(app)
        self.perform_destroy(app)

        return Response(
            {
                "detail": "App deleted successfully.",
                "logs": result.get("logs", ""),
            },
            status=status.HTTP_200_OK,
        )
    
    # GET /api/apps/{id}/status/
    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        app = self.get_object()

        core_v1 = get_kubernetes_client()
        pods = core_v1.list_namespaced_pod(
            namespace=app.namespace,
            label_selector=f"app-manager-id={app.id}",
        ).items
        
        if len(pods) > 0 :
            status = "running"
        else:
            status = "not-running"
            
        return Response({
            "app_id": app.id,
            "status": status,
            "pod_count": len(pods),
        })

    # GET /api/apps/status/
    @action(detail=False, methods=["get"], url_path="status")
    def statuses(self, request):
        core_v1 = get_kubernetes_client()
        results = []

        for app in self.get_queryset():

            pods = core_v1.list_namespaced_pod(
                namespace=app.namespace,
                label_selector=f"app-manager-id={app.id}",
            ).items

            if len(pods) > 0 :
                status = "running"
            else:
                status = "not-running"
                
            results.append({
                "app_id": app.id,
                "namespace": app.namespace,
                "status": status,
                "pod_count": len(pods)
            })

        return Response({"results": results})


class DeploymentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Deployment.objects.select_related("app")
    serializer_class = DeploymentSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()

        app_id = self.request.query_params.get("app")

        if app_id:
            queryset = queryset.filter(app_id=app_id)

        return queryset

    # POST /api/deployments/
    def create(self, request, *args, **kwargs):
        serializer = DeploymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        app = serializer.validated_data["app"]

        deployment = Deployment.objects.create(
            app=app,
            status=Deployment.Status.IN_PROGRESS,
        )

        try:
            values = build_values(app)
            deployment.helm_values = values
            result = deploy_app(app, values)

            deployment.logs = result.get("logs", "")
            deployment.status = (
                Deployment.Status.SUCCESS
                if result.get("success")
                else Deployment.Status.FAILED
            )

        except Exception as exc:
            deployment.status = Deployment.Status.FAILED
            deployment.logs = (
                f"Deployment failed: {type(exc).__name__}"
            )

        finally:
            deployment.save(
            update_fields=[
                "status",
                "logs",
                "helm_values",
                "finished_at",
                ]
            )

        return Response(
            DeploymentSerializer(deployment).data,
            status=status.HTTP_201_CREATED,
        )