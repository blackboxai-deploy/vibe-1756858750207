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
import { Task } from '@/lib/types';

interface NewTaskModalProps {
  children: React.ReactNode;
  projectId?: string;
}

export function NewTaskModal({ children, projectId }: NewTaskModalProps) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    assigneeId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      projectId: formData.projectId,
      assigneeId: formData.assigneeId || undefined,
      status: 'todo',
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      attachments: [],
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });

    // Create notification for assignee
    if (formData.assigneeId && formData.assigneeId !== state.currentUser?.id) {
      const notification = {
        id: `notif-${Date.now()}`,
        userId: formData.assigneeId,
        type: 'task_assigned' as const,
        title: 'Nueva tarea asignada',
        content: `Se te ha asignado la tarea "${formData.title}"`,
        read: false,
        createdAt: new Date(),
        actionUrl: '/projects',
        metadata: { taskId: newTask.id, projectId: formData.projectId },
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      projectId: projectId || '',
      assigneeId: '',
      priority: 'medium',
      dueDate: '',
      tags: '',
    });
    setOpen(false);
  };

  // Get available projects and users
  const availableProjects = state.projects.filter(p => p.status !== 'completed');
  const availableUsers = state.users;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la Tarea *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Implementar login de usuarios"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los detalles de la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Proyecto *</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                disabled={!!projectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Asignar a</Label>
              <Select value={formData.assigneeId} onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="dueDate">Fecha Límite</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="frontend, urgent, bug (separadas por comas)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.projectId}>
              Crear Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}