'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NewProjectModal } from '../projects/NewProjectModal';
import { NewTeamModal } from '../teams/NewTeamModal';
import { FileUploadModal } from '../files/FileUploadModal';

export function Dashboard() {
  const { state } = useApp();

  // Calculate statistics
  const activeProjects = state.projects.filter(p => p.status === 'active').length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = state.tasks.filter(t => t.status === 'todo').length;
  const unreadMessages = state.messages.filter(m => 
    !m.readBy.some(r => r.userId === state.currentUser?.id)
  ).length;

  // Recent activity
  const recentTasks = state.tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentProjects = state.projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bienvenido, {state.currentUser?.name}. Aquí tienes un resumen de tu trabajo.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Proyectos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
            <p className="text-xs text-gray-500 mt-1">
              de {state.projects.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {completedTasks} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Mensajes Sin Leer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{unreadMessages}</div>
            <p className="text-xs text-gray-500 mt-1">
              en {state.channels.length} canales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Equipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{state.teams.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {state.currentUser?.teams.length} asignados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Proyectos Recientes</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/projects">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const team = state.teams.find(t => t.id === project.teamId);
                const projectTasks = state.tasks.filter(t => t.projectId === project.id);
                const completedProjectTasks = projectTasks.filter(t => t.status === 'completed');
                const progress = projectTasks.length > 0 
                  ? Math.round((completedProjectTasks.length / projectTasks.length) * 100)
                  : 0;

                return (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={
                            project.status === 'active' ? 'default' :
                            project.status === 'completed' ? 'secondary' :
                            project.status === 'planning' ? 'outline' : 'destructive'
                          }>
                            {project.status === 'active' ? 'Activo' :
                             project.status === 'completed' ? 'Completado' :
                             project.status === 'planning' ? 'Planificación' : 'En pausa'}
                          </Badge>
                          <Badge variant="outline">
                            {team?.name}
                          </Badge>
                          <Badge variant={
                            project.priority === 'high' ? 'destructive' :
                            project.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {project.priority === 'high' ? 'Alta' :
                             project.priority === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad Reciente</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/projects">Ver tareas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const project = state.projects.find(p => p.id === task.projectId);
                const assignee = state.users.find(u => u.id === task.assigneeId);
                
                return (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {project?.name}
                        </p>
                        {assignee && (
                          <p className="text-xs text-gray-400 mt-1">
                            Asignado a {assignee.name}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          task.status === 'completed' ? 'secondary' :
                          task.status === 'in-progress' ? 'default' :
                          task.status === 'review' ? 'outline' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {task.status === 'completed' ? 'Completada' :
                         task.status === 'in-progress' ? 'En progreso' :
                         task.status === 'review' ? 'Revisión' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <NewProjectModal>
              <Button>🆕 Nuevo Proyecto</Button>
            </NewProjectModal>
            <NewTeamModal>
              <Button variant="outline">👥 Crear Equipo</Button>
            </NewTeamModal>
            <Button asChild variant="outline">
              <Link href="/chat">💬 Abrir Chat</Link>
            </Button>
            <FileUploadModal>
              <Button variant="outline">📁 Subir Archivo</Button>
            </FileUploadModal>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}