'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { FilesView } from '@/components/files/FilesView';

export default function FilesPage() {
  return (
    <MainLayout>
      <FilesView />
    </MainLayout>
  );
}