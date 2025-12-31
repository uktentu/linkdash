import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Users, Trash2, Calendar, ArrowRight } from 'lucide-react';

export function TeamCard({ team, onView, onDelete }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium rounded-2xl p-5 flex flex-col justify-between h-full group relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Users className="w-5 h-5" />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                        title="Leave Team"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    {team.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mb-6">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(team.joinedAt).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        {team.categories.length} Collections
                    </div>
                    <div className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        {team.categories.reduce((a, c) => a + c.urls.length, 0)} Links
                    </div>
                </div>
            </div>

            <button
                onClick={onView}
                className="mt-6 w-full py-2.5 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:border-indigo-500/30 group-hover:text-indigo-400"
            >
                View Team Dashboard <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
