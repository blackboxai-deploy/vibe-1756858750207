'use client';

import { useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileAttachment } from '@/lib/types';

interface FileUploadModalProps {
  children: React.ReactNode;
}

export function FileUploadModal({ children }: FileUploadModalProps) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [projectId, setProjectId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    Array.from(selectedFiles).forEach((file) => {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      let placeholderUrl = '';
      
      if (file.type.startsWith('image/')) {
        placeholderUrl = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=entropy&auto=format&q=60`;
      } else if (file.type.includes('pdf')) {
        placeholderUrl = `https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=500&fit=crop&crop=entropy&auto=format&q=60`;
      } else if (file.type.startsWith('video/')) {
        placeholderUrl = `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop&crop=entropy&auto=format&q=60`;
      } else if (file.type.includes('zip') || file.type.includes('rar')) {
        placeholderUrl = `https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60`;
      } else {
        placeholderUrl = `https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60`;
      }

      const newFile: FileAttachment = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: placeholderUrl,
        uploaderId: state.currentUser!.id,
        uploadedAt: new Date(),
        projectId: projectId || undefined,
      };

      dispatch({ type: 'ADD_FILE', payload: newFile });

      if (projectId) {
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          const notification = {
            id: `notif-${Date.now()}`,
            userId: state.currentUser!.id,
            type: 'file_shared' as const,
            title: 'Archivo subido',
            content: `Se subió el archivo "${file.name}" al proyecto "${project.name}"`,
            read: false,
            createdAt: new Date(),
            actionUrl: '/files',
            metadata: { fileId: newFile.id, projectId },
          };
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        }
      }
    });

    setSelectedFiles(null);
    setProjectId('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Archivos</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Arrastra archivos aquí
                </p>
                <p className="text-sm text-gray-600">
                  o haz clic para seleccionar archivos
                </p>
              </div>
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFiles.length} archivo(s) seleccionado(s)
                  </p>
                  <div className="text-xs text-gray-600 mt-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index}>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />

          <div className="space-y-2">
            <Label htmlFor="project">Asociar a Proyecto (Opcional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Sin proyecto específico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin proyecto</SelectItem>
                {state.projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedFiles || selectedFiles.length === 0}>
              Subir {selectedFiles?.length || 0} Archivo(s)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}