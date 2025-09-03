'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { NewTaskModal } from './NewTaskModal';
import { Project, Task } from '@/lib/types';

interface KanbanBoardProps {
  projects: Project[];
}

export function KanbanBoard({ projects }: KanbanBoardProps) {
  const { state, dispatch } = useApp();
  const [selectedProject, setSelectedProject] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay proyectos disponibles
        </h3>
        <p className="text-gray-500">
          Crea un proyecto para ver el tablero Kanban
        </p>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProject) || projects[0];
  const projectTasks = state.tasks.filter(t => t.projectId === currentProject.id);

  const columns = [
    { 
      id: 'todo', 
      title: 'Pendiente', 
      tasks: projectTasks.filter(t => t.status === 'todo'),
      color: 'border-gray-300'
    },
    { 
      id: 'in-progress', 
      title: 'En Progreso', 
      tasks: projectTasks.filter(t => t.status === 'in-progress'),
      color: 'border-blue-300'
    },
    { 
      id: 'review', 
      title: 'En Revisión', 
      tasks: projectTasks.filter(t => t.status === 'review'),
      color: 'border-purple-300'
    },
    { 
      id: 'completed', 
      title: 'Completado', 
      tasks: projectTasks.filter(t => t.status === 'completed'),
      color: 'border-green-300'
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { taskId, currentStatus } = data;
      
      if (currentStatus !== newStatus) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: {
            id: taskId,
            updates: { status: newStatus }
          }
        });

        if (newStatus === 'completed') {
          const task = state.tasks.find(t => t.id === taskId);
          if (task?.assigneeId) {
            const notification = {
              id: `notif-${Date.now()}`,
              userId: task.assigneeId,
              type: 'task_assigned' as const,
              title: 'Tarea completada',
              content: `¡Felicitaciones! Has completado la tarea "${task.title}"`,
              read: false,
              createdAt: new Date(),
              actionUrl: '/projects',
              metadata: { taskId: task.id, projectId: task.projectId },
            };
            dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
          }
        }
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Tablero Kanban</h3>
          <select
            className="px-3 py-1 border rounded-md text-sm"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <NewTaskModal projectId={currentProject.id}>
          <Button>+ Nueva Tarea</Button>
        </NewTaskModal>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{currentProject.name}</h4>
              <p className="text-sm text-gray-600">{currentProject.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                📋 {projectTasks.length} tareas totales
              </div>
              <div className="text-sm text-gray-500">
                ✅ {projectTasks.filter(t => t.status === 'completed').length} completadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">{column.title}</h3>
              <Badge variant="outline" className="text-xs">
                {column.tasks.length}
              </Badge>
            </div>
            
            <div 
              className={`min-h-[500px] p-2 border-2 border-dashed ${column.color} rounded-lg transition-colors`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as Task['status'])}
            >
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Arrastra tareas aquí
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}