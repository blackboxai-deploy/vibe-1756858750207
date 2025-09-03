'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadModal } from './FileUploadModal';

export function FilesView() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter files
  const filteredFiles = state.files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    if (type.includes('text')) return '📝';
    if (type.includes('figma')) return '🎨';
    return '📁';
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Download file
  const downloadFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Archivos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona y organiza todos los archivos de tus proyectos
          </p>
        </div>
        <FileUploadModal>
          <Button>📁 Subir Archivo</Button>
        </FileUploadModal>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar archivos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="image">Imágenes</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="zip">Archivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
              <div>
                <div className="text-lg font-semibold">{state.files.length}</div>
                <div className="text-sm text-gray-500">Total archivos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🖼️</span>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {state.files.filter(f => f.type.includes('image')).length}
                </div>
                <div className="text-sm text-gray-500">Imágenes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {state.files.filter(f => f.type.includes('pdf')).length}
                </div>
                <div className="text-sm text-gray-500">Documentos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💾</span>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatFileSize(state.files.reduce((total, file) => total + file.size, 0))}
                </div>
                <div className="text-sm text-gray-500">Espacio usado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => {
          const uploader = state.users.find(u => u.id === file.uploaderId);
          const project = file.projectId ? state.projects.find(p => p.id === file.projectId) : null;
          const task = file.taskId ? state.tasks.find(t => t.id === file.taskId) : null;

          return (
            <Card key={file.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* File Preview */}
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {file.type.includes('image') ? (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">{getFileIcon(file.type)}</span>
                    )}
                  </div>

                  {/* File Info */}
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1">
                    {project && (
                      <Badge variant="outline" className="text-xs">
                        📋 {project.name}
                      </Badge>
                    )}
                    {task && (
                      <Badge variant="outline" className="text-xs block">
                        ✅ {task.title}
                      </Badge>
                    )}
                  </div>

                  {/* Uploader */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {uploader?.name.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {uploader?.name || 'Usuario desconocido'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => downloadFile(file)}
                    >
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      ⋯
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {state.files.length === 0 ? 'No hay archivos' : 'No se encontraron archivos'}
          </h3>
          <p className="text-gray-500 mb-6">
            {state.files.length === 0 
              ? 'Sube tu primer archivo para comenzar' 
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
          {state.files.length === 0 && (
            <FileUploadModal>
              <Button>Subir Primer Archivo</Button>
            </FileUploadModal>
          )}
        </div>
      )}
    </div>
  );
}