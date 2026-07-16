import { notFound } from 'next/navigation';
import PlanTaskWorkspace from '@/components/PlanTaskWorkspace';

export default async function PlanTaskPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: rawDay } = await params;
  const day = Number(rawDay);
  if (!Number.isInteger(day) || day < 1 || day > 7) notFound();
  return <PlanTaskWorkspace day={day} />;
}
