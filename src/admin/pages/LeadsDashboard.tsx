import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Phone,
  TrendingUp,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const API_BASE = '/backend/api/crm-leads.php';

interface DashboardStats {
  total_leads: number;
  new_leads_30_days: number;
  contacted_leads: number;
  pipeline_leads: number;
  closed_won: number;
  closed_lost: number;
  dead_junk: number;
  leads_by_status: { lead_status: string; count: number }[];
  leads_by_source: { lead_source: string; count: number }[];
  leads_per_day: { date: string; count: number }[];
  deal_value_by_owner: { lead_owner: string; total_value: number }[];
  overdue_followups: {
    id: number;
    lead_id: string;
    full_name: string;
    company_name: string;
    next_followup_at: string;
    lead_status: string;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export const LeadsDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}?action=dashboard`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Failed to load dashboard data</div>;
  }

  const kpiCards = [
    { title: 'Total Leads', value: stats.total_leads, icon: Users, color: 'bg-blue-500' },
    { title: 'New Leads (30d)', value: stats.new_leads_30_days, icon: UserPlus, color: 'bg-green-500' },
    { title: 'Contacted', value: stats.contacted_leads, icon: Phone, color: 'bg-yellow-500' },
    { title: 'In Pipeline', value: stats.pipeline_leads, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Closed - Won', value: stats.closed_won, icon: CheckCircle, color: 'bg-emerald-500' },
    { title: 'Closed - Lost', value: stats.closed_lost, icon: XCircle, color: 'bg-red-500' },
    { title: 'Dead / Junk', value: stats.dead_junk, icon: Trash2, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpiCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className={`absolute top-0 right-0 w-16 h-16 ${card.color} opacity-10 rounded-bl-full`}></div>
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-gray-500">{card.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.leads_by_status} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="lead_status" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leads_by_source}
                    dataKey="count"
                    nameKey="lead_source"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ lead_source, count }) => `${lead_source}: ${count}`}
                  >
                    {stats.leads_by_source.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads Created (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.leads_per_day}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expected Deal Value by Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.deal_value_by_owner}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lead_owner" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Deal Value']} />
                  <Bar dataKey="total_value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Overdue Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.overdue_followups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No overdue follow-ups
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Lead ID</th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Company</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-left py-2 px-3 font-medium">Overdue Since</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.overdue_followups.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono text-xs">{lead.lead_id}</td>
                      <td className="py-2 px-3">{lead.full_name}</td>
                      <td className="py-2 px-3">{lead.company_name || '-'}</td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="text-xs">
                          {lead.lead_status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-red-600">
                        {new Date(lead.next_followup_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
