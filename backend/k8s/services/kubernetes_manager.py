from kubernetes import client, config


def get_kubernetes_client():
      configuration = client.Configuration()

      config.load_kube_config(
            client_configuration=configuration,
      )

      api_client = client.ApiClient(configuration)

      return client.CoreV1Api(api_client)