'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectsView } from '@/components/projects/ProjectsView';

export default function ProjectsPage() {
  return (
    <MainLayout>
      <ProjectsView />
    </MainLayout>
  );
}