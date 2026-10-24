import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import AddAppModal from '@/components/AddAppModal';

const API = 'http://localhost:8000/api';

const fetcher = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Request failed');
  }

  return response.json();
};

export default function AppsList() {
  const {
    data: appData,
    error,
    isLoading,
  } = useSWR(`${API}/apps/`, fetcher);

  const {
    data: statusData,
    error: statusError,
    isLoading: statusLoading,
  } = useSWR(`${API}/apps/status/`, fetcher, {
    refreshInterval: 10000,
  });

  const apps = appData;

  const statuses = statusData?.results ?? [];

  const statusMap = Object.fromEntries(
    statuses.map((item) => [item.app_id, item])
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Loading applications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive">
          Failed to load applications
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Applications
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your Kubernetes deployments
              </p>
            </div>

            <AddAppModal />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="mb-2 text-lg font-medium">
              No apps
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create your first application.
            </p>
            <AddAppModal />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => {
              const appStatus = statusMap[app.id];
              const status = statusError
                ? 'unavailable'
                : appStatus?.status ?? 'unknown';

              const statusClass =
                status === 'running'
                  ? 'bg-green-100 text-green-800'
                  : status === 'not-running'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-muted text-muted-foreground';

              return (
                <Link
                  key={app.id}
                  to={`/app/${app.id}`}
                  className="group block"
                >
                  <Card className="h-full cursor-pointer transition-all hover:border-foreground/20 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-medium group-hover:text-primary">
                            {app.name}
                          </h3>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {app.namespace}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                        >
                          {statusLoading && !appStatus
                            ? 'Loading...'
                            : status === 'running'
                              ? 'Running'
                              : status === 'not-running'
                                ? 'Not running'
                                : status === 'unavailable'
                                  ? 'Unavailable'
                                  : 'Unknown'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">
                            Image
                          </p>
                          <p className="truncate text-sm">
                            {app.image}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Replicas
                            </p>
                            <p className="text-sm font-medium">
                              {app.replicas}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Port
                            </p>
                            <p className="text-sm font-medium">
                              {app.port}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Pods
                            </p>
                            <p className="text-sm font-medium">
                              {appStatus?.pod_count ?? '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                          Updated {app.updated_at}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}