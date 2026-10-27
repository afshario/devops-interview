from packages.kubernetes_manager import get_kubernetes_client

def get_app_status(app):
      core_v1 = get_kubernetes_client()

      pods = core_v1.list_namespaced_pod(
            namespace=app.namespace,
            label_selector=f"app-manager-id={app.id}",
      ).items

      return {
            "app_id": app.id,
            "status": "running" if pods else "not-running",
            "pod_count": len(pods),
      }


def get_apps_status(apps):
      core_v1 = get_kubernetes_client()
      results = []
      apps_by_namespace = {}

      for app in apps:
            apps_by_namespace.setdefault(app.namespace, []).append(app)

      for namespace, namespace_apps in apps_by_namespace.items():
            pods = core_v1.list_namespaced_pod(
                  namespace=namespace,
                  label_selector="app-manager-id",
            ).items

            pod_counts = {}

            for pod in pods:
                  labels = pod.metadata.labels or {}
                  app_id = labels.get("app-manager-id")

                  if app_id is not None:
                        pod_counts[str(app_id)] = (
                              pod_counts.get(str(app_id), 0) + 1
                        )

            for app in namespace_apps:
                  pod_count = pod_counts.get(str(app.id), 0)

                  results.append({
                  "app_id": app.id,
                  "namespace": app.namespace,
                  "status": (
                        "running" if pod_count > 0 else "not-running"
                  ),
                  "pod_count": pod_count,
                  })

      return results