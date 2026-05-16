import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    case 'IN_PROGRESS': return 'text-amber-700 bg-amber-50 border-amber-100';
    case 'TODO': return 'text-slate-600 bg-slate-50 border-slate-100';
    default: return 'text-slate-600 bg-slate-50 border-slate-100';
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL': return 'text-rose-700 bg-rose-50 border-rose-100';
    case 'HIGH': return 'text-orange-700 bg-orange-50 border-orange-100';
    case 'MEDIUM': return 'text-blue-700 bg-blue-50 border-blue-100';
    case 'LOW': return 'text-slate-600 bg-slate-50 border-slate-100';
    default: return 'text-slate-600 bg-slate-50 border-slate-100';
  }
}
