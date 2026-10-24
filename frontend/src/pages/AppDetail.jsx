import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import { Card, CardContent } from '@/components/ui/card';
import EditAppModal from '@/components/EditAppModal';
import DeleteAppModal from '@/components/DeleteAppModal';

const API_BASE = 'http://localhost:8000/api';

const fetcher = async (url) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || 'Failed to fetch data.'
    );
  }

  return data;
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase().replace('_', '-')) {
    case 'success':
      return 'bg-green-100 text-green-800';

    case 'failed':
      return 'bg-red-100 text-red-800';

    case 'in-progress':
      return 'bg-blue-100 text-blue-800';

    default:
      return 'bg-muted text-muted-foreground';
  }
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(status)}`}
  >
    {status || 'Unknown'}
  </span>
);

export default function AppDetail() {
  const { id } = useParams();
  const { mutate } = useSWRConfig();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState('');
  const [deployMessage, setDeployMessage] = useState('');

  const appUrl = `${API_BASE}/apps/${id}/`;
  const deploymentsUrl = `${API_BASE}/deployments/?app=${id}`;
  const {
    data: app,
    error,
    isLoading,
  } = useSWR(appUrl, fetcher);

  const {
    data: deploymentData,
    error: deploymentsError,
    isLoading: deploymentsLoading,
  } = useSWR(deploymentsUrl, fetcher);

  const deployments = Array.isArray(deploymentData)
    ? deploymentData
    : deploymentData?.results ?? [];

    const handleDeploy = async () => {
      setIsDeploying(true);
      setDeployError('');
      setDeployMessage('');
    
      try {
        const response = await fetch(`${API_BASE}/deployments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "app_id": Number(id),
          }),
        });
    
        const result = await response.json().catch(() => ({}));
    
        if (!response.ok) {
          throw new Error(
            result.detail ||
            result.error ||
            result.error_message ||
            'Failed to create deployment.'
          );
        }
    
        setDeployMessage('Deployment request completed.');
    
        await mutate(deploymentsUrl);
      } catch (err) {
        setDeployError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsDeploying(false);
      }
    };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">
          Loading application...
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-destructive">
          {error?.message || 'Application not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                aria-label="Back to applications"
                className="rounded-md p-2 transition-colors hover:bg-muted"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {app.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Application details and configuration
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeploying ? 'Deploying...' : 'Deploy'}
              </button>

              <EditAppModal app={app} />
              <DeleteAppModal app={app} />
            </div>
          </div>

          {deployMessage && (
            <p
              role="status"
              className="mt-4 text-sm text-green-700"
            >
              {deployMessage}
            </p>
          )}

          {deployError && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              Deployment request failed: {deployError}
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto grid max-w-4xl gap-6">
          {/* Configuration */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6 text-sm font-medium">
                Configuration
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Namespace
                    </div>
                    <div className="text-sm">{app.namespace}</div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Container Image
                    </div>
                    <div className="break-all text-sm">{app.image}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Replicas
                    </div>
                    <div className="text-2xl font-semibold">
                      {app.replicas}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Port
                    </div>
                    <div className="text-2xl font-semibold">
                      {app.port}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment variables */}
          {app.environment_variables &&
            Object.keys(app.environment_variables).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-sm font-medium">
                    Environment Variables
                  </h2>

                  <div className="space-y-2">
                    {Object.entries(app.environment_variables).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-wrap gap-2 text-sm"
                        >
                          <span className="font-medium">{key}:</span>
                          <span className="break-all text-muted-foreground">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Timeline */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6 text-sm font-medium">Timeline</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">
                    Created
                  </div>
                  <div className="text-sm">
                    {app.created_at}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="text-sm">
                    {app.updated_at}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment history */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Deployments
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Deployment history for this application
                  </p>
                </div>

                <span className="text-sm text-muted-foreground">
                  {deployments.length} total
                </span>
              </div>

              {deploymentsLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Loading deployments...
                </p>
              ) : deploymentsError ? (
                <p role="alert" className="py-4 text-sm text-destructive">
                  Failed to load deployments. {deploymentsError.message}
                </p>
              ) : deployments.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="font-medium">No deployments yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {deployments.map((deployment) => {
                    const deploymentId = deployment.id ?? deployment.pk;

                    return (
                      <Link
                        key={deploymentId}
                        to={`/deployments/${deploymentId}`}
                        className="flex flex-col gap-3 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:px-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            Deployment {deploymentId}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Created: {deployment.created_at}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <StatusBadge status={deployment.status} />
                          <span
                            aria-hidden="true"
                            className="text-muted-foreground"
                          >
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}