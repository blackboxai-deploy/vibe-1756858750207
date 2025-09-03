'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { state, dispatch } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const assignee = state.users.find(u => u.id === task.assigneeId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: { status: newStatus }
      }
    });

    // Create notification for assignee
    if (task.assigneeId && task.assigneeId !== state.currentUser?.id) {
      const notification = {
        id: `notif-${Date.now()}`,
        userId: task.assigneeId,
        type: 'task_assigned' as const,
        title: 'Tarea actualizada',
        content: `El estado de "${task.title}" cambió a ${getStatusText(newStatus)}`,
        read: false,
        createdAt: new Date(),
        actionUrl: '/projects',
        metadata: { taskId: task.id, projectId: task.projectId },
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'Pendiente';
      case 'in-progress': return 'En Progreso';
      case 'review': return 'En Revisión';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `Vencida hace ${Math.abs(days)} días`;
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `Vence en ${days} días`;
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, currentStatus: task.status }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      className={`mb-3 cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 transform rotate-3' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
              {task.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <span className="text-sm">⋯</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('todo')}
                  disabled={task.status === 'todo'}
                >
                  Marcar como Pendiente
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={task.status === 'in-progress'}
                >
                  Marcar en Progreso
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('review')}
                  disabled={task.status === 'review'}
                >
                  Enviar a Revisión
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('completed')}
                  disabled={task.status === 'completed'}
                >
                  Marcar Completado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </Badge>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Assignee */}
            {assignee ? (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {assignee.name.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Sin asignar</span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span className={`text-xs ${
                new Date(task.dueDate) < new Date() 
                  ? 'text-red-600 font-medium' 
                  : new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
                    ? 'text-yellow-600 font-medium'
                    : 'text-gray-500'
              }`}>
                📅 {formatDueDate(new Date(task.dueDate))}
              </span>
            )}
          </div>

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="text-xs text-gray-500">
              📎 {task.attachments.length} archivo{task.attachments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}