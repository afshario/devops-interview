import { useState } from 'react';
import { mutate } from 'swr';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AddAppModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    namespace: 'default',
    image: '',
    replicas: 1,
    port: 80,
    environment_variables: {},
  });
  const [envVarsText, setEnvVarsText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let envVars = {};
    if (envVarsText.trim()) {
      try {
        envVarsText.split('\n').forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.includes('=')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        });
      } catch (error) {
        console.error('Error parsing environment variables:', error);
      }
    }
    
    const dataToSubmit = {
      ...formData,
      environment_variables: envVars
    };
    
    try {
      const response = await fetch('http://localhost:8000/api/apps/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        mutate('http://localhost:8000/api/app/');
        setOpen(false);
        setFormData({
          name: '',
          namespace: 'default',
          image: '',
          replicas: 1,
          port: 80,
          environment_variables: {},
        });
        setEnvVarsText('');
      }
    } catch (error) {
      console.error('Error creating app:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'replicas' || name === 'port' ? parseInt(value) : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New App</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New App</DialogTitle>
            <DialogDescription>
              Deploy a new application to Kubernetes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace</Label>
              <Input
                id="namespace"
                name="namespace"
                value={formData.namespace}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="nginx:latest"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="replicas">Replicas</Label>
                <Input
                  id="replicas"
                  name="replicas"
                  type="number"
                  min="1"
                  value={formData.replicas}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  name="port"
                  type="number"
                  min="1"
                  max="65535"
                  value={formData.port}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="envVars">Environment Variables</Label>
              <Textarea
                id="envVars"
                value={envVarsText}
                onChange={(e) => setEnvVarsText(e.target.value)}
                placeholder="KEY=value&#10;ANOTHER_KEY=another value"
                className="h-24"
              />
              <p className="text-xs text-muted-foreground">
                Enter each variable on a new line as KEY=value
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create App</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}