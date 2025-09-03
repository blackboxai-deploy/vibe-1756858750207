'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { TeamsView } from '@/components/teams/TeamsView';

export default function TeamsPage() {
  return (
    <MainLayout>
      <TeamsView />
    </MainLayout>
  );
}