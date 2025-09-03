'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewTeamModal } from './NewTeamModal';

export function TeamsView() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los equipos de trabajo y sus miembros
          </p>
        </div>
        <NewTeamModal>
          <Button>👥 Nuevo Equipo</Button>
        </NewTeamModal>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.teams.map((team) => {
          const teamMembers = state.users.filter(user => team.members.includes(user.id));
          const teamProjects = state.projects.filter(project => project.teamId === team.id);
          const activeProjects = teamProjects.filter(p => p.status === 'active');

          return (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: team.color + '20', color: team.color }}
                    >
                      <span className="text-xl font-bold">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {teamMembers.length} miembros
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-600">
                    {team.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-blue-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">
                        {activeProjects.length}
                      </div>
                      <div className="text-xs text-blue-500">Proyectos Activos</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-600">
                        {teamProjects.length}
                      </div>
                      <div className="text-xs text-green-500">Total Proyectos</div>
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Miembros</h4>
                    <div className="space-y-2">
                      {teamMembers.slice(0, 4).map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-gray-700">{member.name}</span>
                            <Badge variant="outline" className="text-xs ml-2 capitalize">
                              {member.role}
                            </Badge>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      ))}
                      {teamMembers.length > 4 && (
                        <div className="text-xs text-gray-500 pl-8">
                          +{teamMembers.length - 4} miembros más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Projects */}
                  {teamProjects.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Proyectos Recientes</h4>
                      <div className="space-y-1">
                        {teamProjects.slice(0, 3).map((project) => {
                          const projectTasks = state.tasks.filter(t => t.projectId === project.id);
                          const completedTasks = projectTasks.filter(t => t.status === 'completed');
                          const progress = projectTasks.length > 0 
                            ? Math.round((completedTasks.length / projectTasks.length) * 100)
                            : 0;

                          return (
                            <div key={project.id} className="flex items-center justify-between py-1">
                              <span className="text-sm text-gray-600 truncate">
                                {project.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  project.status === 'active' ? 'default' :
                                  project.status === 'completed' ? 'secondary' :
                                  project.status === 'planning' ? 'outline' : 'destructive'
                                } className="text-xs">
                                  {project.status === 'active' ? 'Activo' :
                                   project.status === 'completed' ? 'Completado' :
                                   project.status === 'planning' ? 'Planificación' : 'Pausado'}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {progress}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      💬 Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {state.teams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay equipos creados
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primer equipo para organizar tu trabajo
          </p>
          <NewTeamModal>
            <Button>Crear Primer Equipo</Button>
          </NewTeamModal>
        </div>
      )}
    </div>
  );
}