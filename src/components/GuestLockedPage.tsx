import { LucideIcon, LogIn } from 'lucide-react';

interface FeatureCard {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  title: string;
  description: string;
}

interface GuestLockedPageProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ctaLabel: string;
  cards: FeatureCard[];
  onLoginRequest: () => void;
}

export function GuestLockedPage({
  icon: PageIcon,
  title,
  subtitle,
  ctaLabel,
  cards,
  onLoginRequest,
}: GuestLockedPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pb-32 p-6 lg:ml-64 animate-in fade-in duration-500">
      {/* Icon — clean solid container */}
      <div className="w-24 h-24 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl flex items-center justify-center mb-8 shadow-xl dark:shadow-blue-900/20">
        <PageIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center max-w-md tracking-tight">
        {title}
      </h1>
      <p className="text-base text-gray-500 dark:text-slate-400 mb-10 text-center max-w-sm leading-relaxed">
        {subtitle}
      </p>

      {/* Feature cards */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full mb-10">
          {cards.map((card, i) => {
            const CardIcon = card.icon;
            return (
              <div
                key={i}
                className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all text-left"
              >
                {/* Top accent bar for professional look */}
                <div 
                  className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" 
                  style={{ backgroundColor: card.borderColor }} 
                />
                
                <CardIcon className={`w-8 h-8 mb-1 ${card.iconColor}`} />
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1.5">{card.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onLoginRequest}
        style={{ backgroundColor: '#2563eb' }}
        className="flex items-center gap-2 px-8 py-4 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
      >
        <LogIn className="w-5 h-5" />
        {ctaLabel}
      </button>
    </div>
  );
}
