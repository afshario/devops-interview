from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api import AppViewSet , DeploymentViewSet


router = DefaultRouter()
router.register("apps", AppViewSet, basename="app")
router.register(
    "deployments",
    DeploymentViewSet,
    basename="deployment",
)

urlpatterns = [
    path("", include(router.urls)),
]