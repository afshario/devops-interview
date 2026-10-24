import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';

const API = 'http://localhost:8000/api';

const fetcher = async (url) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || 'Failed to load deployment'
    );
  }

  return data;
};

  const formatValues = (values) => {
    if (typeof values === 'string') {
      try {
        return JSON.stringify(JSON.parse(values), null, 2);
      } catch {
        return values;
      }
    }

    return JSON.stringify(values, null, 2);
  };

export default function DeploymentDetail() {
  const { id } = useParams();

  const {
    data: deployment,
    error,
    isLoading,
  } = useSWR(`${API}/deployments/${id}/`, fetcher);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Loading deployment...
        </p>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-destructive">
          {error?.message || 'Deployment not found'}
        </p>

        <Link to="/" className="text-sm underline">
          Back to applications
        </Link>
      </div>
    );
  }

  const appId =
    typeof deployment.app === 'object'
      ? deployment.app?.id
      : deployment.app ?? deployment.app_id;

  const helmValues =deployment.helm_values;

  const errorMessage =(deployment.status === 'failed' ? deployment.logs : '');

  const statusClass =
    deployment.status === 'success'
      ? 'bg-green-100 text-green-800'
      : deployment.status === 'failed'
        ? 'bg-red-100 text-red-800'
        : 'bg-blue-100 text-blue-800';

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            to={appId ? `/app/${appId}` : '/'}
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            Back to application
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Deployment {deployment.id ?? id}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Deployment details and logs
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusClass}`}
            >
              {deployment.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto grid max-w-4xl gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6 text-lg font-semibold">
                Deployment Information
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Deployment ID
                  </p>
                  <p className="text-sm">{deployment.id ?? id}</p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Application
                  </p>
                  <p className="text-sm">
                    {typeof deployment.app === 'object'
                      ? deployment.app?.name ?? appId ?? '—'
                      : deployment.app ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Created
                  </p>
                  <p className="text-sm">
                    {deployment.created_at}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Finished
                  </p>
                  <p className="text-sm">
                    {deployment.finished_at}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-2 text-lg font-semibold">
                Applied Helm Values
              </h2>

              <p className="mb-4 text-sm text-muted-foreground">
                Values used for this deployment.
              </p>

              <pre className="max-h-[600px] overflow-auto rounded-md bg-muted p-4 text-sm leading-6">
                <code>{formatValues(helmValues)}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Error Message
              </h2>

              {errorMessage ? (
                <pre className="whitespace-pre-wrap break-words rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {errorMessage}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No error recorded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Deployment Logs
              </h2>

              {deployment.logs ? (
                <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-4 text-sm leading-6">
                  {deployment.logs}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No logs recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}