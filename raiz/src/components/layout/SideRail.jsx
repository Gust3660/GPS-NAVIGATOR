import { cx } from '../ui/classes.js';

export default function SideRail({ navItems, activeNav, onSelect }) {
  return (
    <aside className="fixed left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-3 rounded-[28px] border border-white/60 bg-white/35 p-2 shadow-uber shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 dark:ring-white/10">
      {navItems.map(([Icon, label]) => (
        <button
          key={label}
          type="button"
          className={cx(
            'relative grid size-12 place-items-center rounded-2xl border border-transparent text-slate-600 transition hover:border-white/55 hover:bg-white/55 hover:text-emerald-600 hover:shadow-lg hover:shadow-slate-900/10 dark:text-slate-200 dark:hover:border-white/10 dark:hover:bg-slate-900/65 dark:hover:text-yellow-300',
            'after:pointer-events-none after:absolute after:left-[calc(100%+0.65rem)] after:top-1/2 after:hidden after:-translate-y-1/2 after:whitespace-nowrap after:rounded-2xl after:border after:border-white/60 after:bg-white/80 after:px-3 after:py-2 after:text-xs after:font-black after:text-slate-950 after:shadow-xl after:shadow-slate-900/15 after:backdrop-blur-2xl after:content-[attr(data-label)] hover:after:block focus-visible:after:block dark:after:border-white/10 dark:after:bg-slate-950/85 dark:after:text-white dark:after:ring-1 dark:after:ring-white/10',
            activeNav === label && 'border-emerald-200/80 bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 ring-1 ring-emerald-100/70 dark:border-yellow-200/30 dark:bg-yellow-300/90 dark:text-slate-950 dark:shadow-slate-900/15 dark:ring-yellow-200/30'
          )}
          data-label={label}
          onClick={() => onSelect(label)}
          aria-label={label}
        >
          <Icon size={24} strokeWidth={2.3} />
        </button>
      ))}
    </aside>
  );
}
