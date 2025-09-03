'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'file' | 'team' | 'user';
  title: string;
  description?: string;
  metadata?: string;
  url?: string;
}

export function GlobalSearch() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search projects
    state.projects.forEach(project => {
      if (project.name.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term)) {
        searchResults.push({
          id: project.id,
          type: 'project',
          title: project.name,
          description: project.description,
          metadata: `Proyecto • ${state.teams.find(t => t.id === project.teamId)?.name}`,
          url: '/projects'
        });
      }
    });

    // Search tasks
    state.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(term) || 
          task.description.toLowerCase().includes(term)) {
        const project = state.projects.find(p => p.id === task.projectId);
        searchResults.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          metadata: `Tarea • ${project?.name}`,
          url: '/projects'
        });
      }
    });

    // Search files
    state.files.forEach(file => {
      if (file.name.toLowerCase().includes(term)) {
        const project = file.projectId ? state.projects.find(p => p.id === file.projectId) : null;
        searchResults.push({
          id: file.id,
          type: 'file',
          title: file.name,
          description: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          metadata: `Archivo • ${project?.name || 'Sin proyecto'}`,
          url: '/files'
        });
      }
    });

    // Search teams
    state.teams.forEach(team => {
      if (team.name.toLowerCase().includes(term) || 
          team.description.toLowerCase().includes(term)) {
        searchResults.push({
          id: team.id,
          type: 'team',
          title: team.name,
          description: team.description,
          metadata: `Equipo • ${team.members.length} miembros`,
          url: '/teams'
        });
      }
    });

    // Search users
    state.users.forEach(user => {
      if (user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)) {
        searchResults.push({
          id: user.id,
          type: 'user',
          title: user.name,
          description: user.email,
          metadata: `Usuario • ${user.role}`,
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsOpen(searchResults.length > 0);
  }, [searchTerm, state]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project': return '📋';
      case 'task': return '✅';
      case 'file': return '📁';
      case 'team': return '👥';
      case 'user': return '👤';
      default: return '🔍';
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-700';
      case 'task': return 'bg-green-100 text-green-700';
      case 'file': return 'bg-purple-100 text-purple-700';
      case 'team': return 'bg-orange-100 text-orange-700';
      case 'user': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url;
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <Input
        placeholder="Buscar proyectos, tareas, archivos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
        className="w-full"
      />
      
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-auto">
          <CardContent className="p-2">
            <div className="space-y-1">
              {results.map((result) => (
                <Button
                  key={`${result.type}-${result.id}`}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span className="text-lg mt-0.5">
                      {getResultIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className={`text-xs ${getResultColor(result.type)}`}>
                          {result.type === 'project' ? 'Proyecto' :
                           result.type === 'task' ? 'Tarea' :
                           result.type === 'file' ? 'Archivo' :
                           result.type === 'team' ? 'Equipo' :
                           'Usuario'}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {result.description}
                        </p>
                      )}
                      {result.metadata && (
                        <p className="text-xs text-gray-400">
                          {result.metadata}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {isOpen && results.length === 0 && searchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-4 text-center text-gray-500">
            No se encontraron resultados para "{searchTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}