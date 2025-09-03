'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project } from '@/lib/types';

interface NewProjectModalProps {
  children: React.ReactNode;
}

export function NewProjectModal({ children }: NewProjectModalProps) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.teamId) return;

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      teamId: formData.teamId,
      status: 'planning',
      priority: formData.priority,
      startDate: new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      progress: 0,
      tasks: [],
      files: [],
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_PROJECT', payload: newProject });

    // Create notification
    const notification = {
      id: `notif-${Date.now()}`,
      userId: state.currentUser!.id,
      type: 'project_update' as const,
      title: 'Nuevo proyecto creado',
      content: `El proyecto "${formData.name}" ha sido creado exitosamente`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/projects',
      metadata: { projectId: newProject.id },
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Reset form
    setFormData({
      name: '',
      description: '',
      teamId: '',
      priority: 'medium',
      endDate: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proyecto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Rediseño de la web"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el objetivo del proyecto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Equipo *</Label>
            <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un equipo" />
              </SelectTrigger>
              <SelectContent>
                {state.teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Baja</SelectItem>
                <SelectItem value="medium">🟡 Media</SelectItem>
                <SelectItem value="high">🔴 Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha Límite</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.teamId}>
              Crear Proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}