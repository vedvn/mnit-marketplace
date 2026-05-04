export const NOTE_BRANCHES = ['CSE', 'AI', 'ECE', 'EE', 'Meta', 'Civil', 'Chemical', 'Mechanical'] as const;
export type NoteBranch = typeof NOTE_BRANCHES[number];

export const NOTE_TYPES = {
  notes: 'Notes',
  past_paper: 'Past Paper',
  assignment: 'Assignment',
  reference: 'Reference',
} as const;
export type NoteType = keyof typeof NOTE_TYPES;

export const NOTE_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const BRANCH_COLORS: Record<string, string> = {
  CSE: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  AI: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  ECE: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  EE: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  Meta: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
  Civil: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  Chemical: 'bg-red-500/10 text-red-700 border-red-500/20',
  Mechanical: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
};

export const TYPE_COLORS: Record<string, string> = {
  notes: 'bg-primary-500/10 text-primary-700',
  past_paper: 'bg-red-500/10 text-red-700',
  assignment: 'bg-amber-500/10 text-amber-700',
  reference: 'bg-emerald-500/10 text-emerald-700',
};
