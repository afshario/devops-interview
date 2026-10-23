import json
import subprocess

chart_oci = "oci://registry.nixys.ru/nuc/nxs-universal-chart"


def split_image_text(image_ref):
      last_slash = image_ref.rfind("/")
      last_colon = image_ref.rfind(":")

      if last_colon > last_slash:
            image = image_ref[:last_colon]
            tag = image_ref[last_colon + 1:]

            if not image or not tag:
                  raise ValueError("Invalid image reference.")

            return image, tag

      return image_ref, "latest"


def build_values(app):
      image, image_tag = split_image_text(app.image)

      app_key = f"app-{app.id}"
      app_label = str(app.id)

      environment = app.environment_variables or {}

      container = {
            "name": "app",
            "image": image,
            "imageTag": image_tag,
            "ports": [
                  {
                  "name": "http",
                  "containerPort": app.port,
                  }
            ],
            "env": [
                  {
                  "name": key,
                  "value": str(value),
                  }
                  for key, value in environment.items()
            ],
      }

      values = {
            "deployments": {
                  app_key: {
                  "replicas": app.replicas,
                  "podLabels": {
                        "app-manager-id": app_label,
                  },
                  "extraSelectorLabels": {
                        "app-manager-id": app_label,
                  },
                  "containers": {
                        "app": container,
                  },
                  }
            },
            "services": {
                  app_key: {
                  "ports": [
                        {
                              "name": "http",
                              "port": app.port,
                              "targetPort": "http",
                        }
                  ],
                  "extraSelectorLabels": {
                        "app-manager-id": app_label,
                  },
                  }
            },
      }

      return values


def values_args(values):
      args = []

      for key, value in values.items():
            args.extend([
                  "--set-json",
                  f"{key}={json.dumps(value, separators=(',', ':'))}",
            ])

      return args


def deploy_app(app, values):
      release_name = f"app-{app.id}"

      common_args = [
            release_name,
            chart_oci,
            "--namespace",
            app.namespace,
            *values_args(values),
      ]

      deploy_command = [
            "helm",
            "upgrade",
            "--install",
            *common_args,
            "--create-namespace",
            "--wait",
            "--timeout",
            "2m",
      ]

      result = subprocess.run(
            deploy_command,
            capture_output=True,
            text=True,
            timeout=360,
            check=False,
      )
      
      if result.returncode == 0:
            success = True
      else:
            success = False

      return {
            "success": success,
            "stage": "deploy",
            "logs": (
                  result.stdout
                  + "\n"
                  + result.stderr
            ),
      }