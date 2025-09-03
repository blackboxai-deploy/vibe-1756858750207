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
import { Team } from '@/lib/types';

interface NewTeamModalProps {
  children: React.ReactNode;
}

const teamColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

export function NewTeamModal({ children }: NewTeamModalProps) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: teamColors[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      members: [state.currentUser!.id], // Add current user as first member
      projects: [],
      createdAt: new Date(),
      color: formData.color,
    };

    dispatch({ type: 'ADD_TEAM', payload: newTeam });

    // Create notification
    const notification = {
      id: `notif-${Date.now()}`,
      userId: state.currentUser!.id,
      type: 'project_update' as const,
      title: 'Nuevo equipo creado',
      content: `El equipo "${formData.name}" ha sido creado exitosamente`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/teams',
      metadata: { teamId: newTeam.id },
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Reset form
    setFormData({
      name: '',
      description: '',
      color: teamColors[0],
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
          <DialogTitle>Crear Nuevo Equipo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Equipo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Desarrollo Frontend"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el propósito del equipo..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color del Equipo</Label>
            <div className="flex gap-2 flex-wrap">
              {teamColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.name}>
              Crear Equipo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}