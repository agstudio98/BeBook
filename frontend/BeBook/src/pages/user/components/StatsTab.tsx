import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar as CalendarIcon, MessageSquare, Globe, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, XAxis, YAxis, CartesianGrid, Area, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';

interface StatsTabProps {
  stats: any;
  language: string;
}

/**
 * StatsTab Component
 * Displays analytical charts and count cards related to user platform usage.
 */
export const StatsTab: React.FC<StatsTabProps> = ({ stats, language }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      key="stats" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="space-y-12"
    >
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h3 className="text-3xl font-heading italic text-light-text">{t('PROFILE.STATS.TITLE')}</h3>
          <p className="text-sm opacity-50 font-body text-light-text">{t('PROFILE.STATS.SUBTITLE')}</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-light-primary/5 border border-light-primary/10 text-[10px] font-bold uppercase tracking-widest text-light-primary">
          {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'orders', label: t('PROFILE.STATS.COUNTS.ORDERS'), val: stats?.counts?.orders || 0, icon: <ShoppingBag size={18} />, color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 'bookings', label: t('PROFILE.STATS.COUNTS.BOOKINGS'), val: stats?.counts?.bookings || 0, icon: <CalendarIcon size={18} />, color: 'text-purple-500', bg: 'bg-purple-50' },
          { id: 'comments', label: t('PROFILE.STATS.COUNTS.COMMENTS'), val: stats?.counts?.comments || 0, icon: <MessageSquare size={18} />, color: 'text-green-500', bg: 'bg-green-50' },
          { id: 'forum', label: t('PROFILE.STATS.COUNTS.FORUM'), val: stats?.counts?.forumPosts || 0, icon: <Globe size={18} />, color: 'text-orange-500', bg: 'bg-orange-50' }
        ].map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={card.id} 
            className="p-6 rounded-[2rem] bg-white border border-light-primary/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className="text-3xl font-bold text-light-text tracking-tighter">{card.val}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="p-8 rounded-[2.5rem] bg-white border border-light-primary/5 shadow-xl space-y-8"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('PROFILE.STATS.CHARTS.DISTRIBUTION')}</h4>
            <PieChartIcon size={14} className="opacity-20" />
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {stats?.activityCounts?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.activityCounts?.reduce((acc: any[], a: any) => {
                      let name = '';
                      if (a._id === 'COMMENT') name = t('PROFILE.STATS.COUNTS.COMMENTS');
                      else if (a._id === 'PURCHASE') name = t('PROFILE.STATS.COUNTS.ORDERS');
                      else if (a._id === 'BOOKING') name = t('PROFILE.STATS.COUNTS.BOOKINGS');
                      else if (a._id.startsWith('FORUM')) name = t('PROFILE.STATS.COUNTS.FORUM');
                      else if (a._id === 'SUBSCRIPTION_UPDATE') name = t('PROFILE.TABS.MEMBERSHIP');
                      else name = a._id;

                      const existing = acc.find(item => item.name === name);
                      if (existing) existing.value += a.count;
                      else acc.push({ name, value: a.count });
                      return acc;
                    }, []) || []}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
                  >
                    {stats?.activityCounts?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-3 opacity-20 italic">
                <PieChartIcon size={40} className="mx-auto" />
                <p className="text-xs">No hay datos de actividad aún</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Spending Area Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="p-8 rounded-[2.5rem] bg-white border border-light-primary/5 shadow-xl space-y-8"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('PROFILE.STATS.CHARTS.SPENDING')}</h4>
            <TrendingUp size={14} className="opacity-20" />
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {stats?.spendingStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.spendingStats || []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="total" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-3 opacity-20 italic">
                <TrendingUp size={40} className="mx-auto" />
                <p className="text-xs">No hay registros de inversión</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bookings Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="col-span-1 lg:col-span-2 p-8 rounded-[2.5rem] bg-white border border-light-primary/5 shadow-xl space-y-8"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('PROFILE.STATS.CHARTS.BOOKINGS_MONTH')}</h4>
            <CalendarIcon size={14} className="opacity-20" />
          </div>
          <div className="h-[320px] w-full flex items-center justify-center">
            {stats?.bookingStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.bookingStats || []}>
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#7C3AED" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-3 opacity-20 italic">
                <CalendarIcon size={40} className="mx-auto" />
                <p className="text-xs">No hay reservas programadas</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
