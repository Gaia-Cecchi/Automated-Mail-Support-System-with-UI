import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Email } from '../types/email';

interface DashboardProps {
  toProcessEmails: Email[];
  processedEmails: Email[];
  historicalStats?: {
    totalProcessed: number;
    totalReceived: number;
    byDepartment: Record<string, number>;
    lastUpdated: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function Dashboard({ toProcessEmails, processedEmails, historicalStats }: DashboardProps) {
  // Today's date normalized
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // All emails from today (received today OR processed today)
  const allTodayEmails = [...toProcessEmails, ...processedEmails].filter(email => {
    // Check if received today
    if (email.timestamp) {
      const receivedDate = email.timestamp instanceof Date 
        ? new Date(email.timestamp) 
        : new Date(email.timestamp);
      receivedDate.setHours(0, 0, 0, 0);
      if (receivedDate.getTime() === today.getTime()) return true;
    }
    
    // Check if processed today
    if (email.processedAt) {
      const processedDate = email.processedAt instanceof Date 
        ? new Date(email.processedAt) 
        : new Date(email.processedAt);
      processedDate.setHours(0, 0, 0, 0);
      if (processedDate.getTime() === today.getTime()) return true;
    }
    
    return false;
  });
  
  // Today's forwarded emails (only actually sent emails)
  const todayForwarded = allTodayEmails.filter(e => e.status === 'forwarded');
  
  // Today's to process emails (everything that is NOT forwarded)
  // Includes: not analyzed, analyzed but not forwarded, cancelled, errors
  const todayToProcess = allTodayEmails.filter(e => e.status !== 'forwarded');
  
  // Average confidence for today's forwarded emails
  const todayAvgConfidence = todayForwarded.length > 0 
    ? (todayForwarded.reduce((sum, e) => sum + (e.confidence || 0), 0) / todayForwarded.length).toFixed(0)
    : 0;
  
  console.log(`📊 Dashboard - Total today: ${allTodayEmails.length}, Forwarded today: ${todayForwarded.length}, To Process today: ${todayToProcess.length}`);
  
  // Calcola statistiche (today)
  const totalEmails = toProcessEmails.length + processedEmails.length;
  const processedCount = processedEmails.length;
  const toProcessCount = toProcessEmails.length;
  const processedPercentage = totalEmails > 0 ? ((processedCount / totalEmails) * 100).toFixed(1) : 0;

  // Statistiche per department
  const departmentStats = processedEmails.reduce((acc, email) => {
    const dept = email.forwardedToDepartment || email.suggestedDepartment || 'Unassigned';
    if (!acc[dept]) {
      acc[dept] = { count: 0, totalConfidence: 0 };
    }
    acc[dept].count++;
    acc[dept].totalConfidence += email.confidence || 0;
    return acc;
  }, {} as Record<string, { count: number; totalConfidence: number }>);

  // Dati per grafico a torta
  const pieData = Object.entries(departmentStats).map(([name, stats]) => ({
    name,
    value: stats.count,
    percentage: ((stats.count / processedCount) * 100).toFixed(1)
  }));

  // Dati per grafico a barre (confidence media per department)
  const barData = Object.entries(departmentStats).map(([name, stats]) => ({
    name,
    confidence: (stats.totalConfidence / stats.count).toFixed(1)
  }));

  // Confidence medio globale
  const avgConfidence = processedEmails.length > 0
    ? (processedEmails.reduce((sum, email) => sum + (email.confidence || 0), 0) / processedEmails.length).toFixed(1)
    : 0;

  return (
    <div className="mb-4 flex-shrink-0">
      {/* Statistiche generali - Due card affiancate */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Today's Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📅 Today</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-row justify-between items-center px-4">
              <div className="text-center flex-1">
                <div className="text-2xl font-bold">{allTodayEmails.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-green-600">{todayForwarded.length}</div>
                <div className="text-xs text-gray-500">Forwarded</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-blue-600">{todayAvgConfidence}%</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-orange-600">{todayToProcess.length}</div>
                <div className="text-xs text-gray-500">To Process</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Time Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📊 All Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-row justify-between items-center px-4">
              <div className="text-center flex-1">
                <div className="text-2xl font-bold">{historicalStats?.totalReceived || totalEmails}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-green-600">{historicalStats?.totalProcessed || processedCount}</div>
                <div className="text-xs text-gray-500">Forwarded</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-blue-600">
                  {processedEmails.length > 0 
                    ? (processedEmails.reduce((sum, e) => sum + (e.confidence || 0), 0) / processedEmails.length).toFixed(0)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-orange-600">{totalEmails - processedCount}</div>
                <div className="text-xs text-gray-500">To Process</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafici affiancati */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {processedEmails.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={55}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
                No processed emails yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confidence by Department</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {processedEmails.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
                No processed emails yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
