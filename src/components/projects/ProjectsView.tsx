'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from './KanbanBoard';
import { NewProjectModal } from './NewProjectModal';

export function ProjectsView() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter projects
  const filteredProjects = state.projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus proyectos y sigue el progreso del equipo
          </p>
        </div>
        <NewProjectModal>
          <Button>🆕 Nuevo Proyecto</Button>
        </NewProjectModal>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="planning">Planificación</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="on-hold">En pausa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">📋 Lista</TabsTrigger>
          <TabsTrigger value="kanban">📊 Kanban</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const team = state.teams.find(t => t.id === project.teamId);
              const projectTasks = state.tasks.filter(t => t.projectId === project.id);
              const completedTasks = projectTasks.filter(t => t.status === 'completed');
              const progress = projectTasks.length > 0 
                ? Math.round((completedTasks.length / projectTasks.length) * 100)
                : 0;

              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                      </div>
                      <Badge variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' :
                        project.status === 'planning' ? 'outline' : 'destructive'
                      }>
                        {project.status === 'active' ? 'Activo' :
                         project.status === 'completed' ? 'Completado' :
                         project.status === 'planning' ? 'Planificación' : 'En pausa'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Team and Priority */}
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          👥 {team?.name}
                        </Badge>
                        <Badge variant={
                          project.priority === 'high' ? 'destructive' :
                          project.priority === 'medium' ? 'default' : 'secondary'
                        } className="text-xs">
                          {project.priority === 'high' ? '🔴 Alta' :
                           project.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progreso</span>
                          <span>{progress}% ({completedTasks.length}/{projectTasks.length})</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="text-lg font-semibold text-blue-600">
                            {projectTasks.length}
                          </div>
                          <div className="text-xs text-blue-500">Tareas</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-lg font-semibold text-green-600">
                            {state.files.filter(f => f.projectId === project.id).length}
                          </div>
                          <div className="text-xs text-green-500">Archivos</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2">
                          <div className="text-lg font-semibold text-purple-600">
                            {team?.members.length || 0}
                          </div>
                          <div className="text-xs text-purple-500">Miembros</div>
                        </div>
                      </div>

                      {/* Due Date */}
                      {project.endDate && (
                        <div className="text-xs text-gray-500">
                          📅 Fecha límite: {new Date(project.endDate).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron proyectos con los filtros aplicados
            </div>
          )}
        </TabsContent>

        {/* Kanban View */}
        <TabsContent value="kanban">
          <KanbanBoard projects={filteredProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}