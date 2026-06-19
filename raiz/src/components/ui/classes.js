export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const drawerClass = 'fixed right-4 top-4 z-30 max-h-[calc(100vh-2rem)] w-[min(420px,calc(100vw-2rem))] overflow-auto rounded-[28px] border border-slate-200/80 bg-white/95 p-5 text-slate-950 shadow-uber backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/95 dark:text-slate-50';
export const drawerHeadClass = 'mb-4 flex items-center gap-3';
export const drawerCloseClass = 'grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800';
export const softButtonClass = 'inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-slate-100 px-5 font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700';
export const iconButtonClass = 'grid size-14 place-items-center rounded-[20px] border border-white/70 bg-white/45 text-slate-950 shadow-xl shadow-slate-900/15 ring-1 ring-white/65 backdrop-blur-2xl transition hover:bg-white/65 active:bg-emerald-400/55 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-50 dark:ring-white/15 dark:hover:bg-slate-900/70 dark:active:bg-yellow-300/80 dark:active:text-slate-950';
export const inputClass = 'min-h-11 min-w-0 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/15';
export const labelTextClass = 'text-sm font-semibold text-slate-700 dark:text-slate-300';
export const panelCardClass = 'rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70';
