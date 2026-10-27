import subprocess
from pathlib import Path
from django.conf import settings
from jinja2 import Environment, FileSystemLoader

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


def build_values_file(app):
      image, image_tag = split_image_text(app.image)
      environment = app.environment_variables or {}
      env = Environment(
            loader=FileSystemLoader(str(settings.BASE_DIR / "templates")),
            autoescape=False,
      )
      template = env.get_template("values.yaml.j2")

      template_output = template.render({
            "app_name" : app.name ,
            "replicas" : app.replicas ,
            "image_name" :image ,
            "image_tag":image_tag ,
            "env": {
                  key: str(value)
                  for key, value in environment.items()
            },
            "app_id":app.id,
            "port":app.port
      })

      template_file = Path(f"generated/values-{app.id}.yaml")
      template_file.write_text(template_output, encoding="utf-8")
      return (template_file , template_output)



def deploy_app(app, file_name):
      release_name = f"app-{app.id}"
      common_args = [
            release_name,
            chart_oci,
            "--namespace",
            app.namespace,
            "-f",
            file_name,
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
      
      
def uninstall_app(app):
      release_name = f"app-{app.id}"

      uninstall_command = [
            "helm",
            "uninstall",
            release_name,
            "-n",
            app.namespace
      ]

      result = subprocess.run(
            uninstall_command,
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
            "stage": "delete",
            "logs": (
                  result.stdout
                  + "\n"
                  + result.stderr
            ),
      }