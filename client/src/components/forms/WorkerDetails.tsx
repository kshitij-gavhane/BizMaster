import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Worker } from "@shared/schema";

function getWeekRange(offsetWeeks = 0) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - offsetWeeks * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd = sunday.toISOString().split('T')[0];
  return { weekStart, weekEnd, label: `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}` };
}

export default function WorkerDetails({ worker }: { worker: Worker }) {
  const weeks = useMemo(() => [0, 1, 2, 3, 4].map(getWeekRange), []);

  const attendanceQueries = weeks.map((w) => ({
    key: ["/api/attendance/worker", worker.id, w.weekStart, w.weekEnd],
    url: `/api/attendance/worker/${worker.id}?weekStart=${w.weekStart}&weekEnd=${w.weekEnd}`,
  }));

  const attendanceData = attendanceQueries.map((q) => {
    const res = useQuery({
      queryKey: q.key,
      queryFn: async () => {
        const r = await fetch(q.url);
        if (!r.ok) throw new Error("Failed to fetch attendance");
        return r.json();
      },
    });
    return res.data || [];
  });

  const { data: advances = [] } = useQuery({
    queryKey: ["/api/advance-payments", worker.id],
    queryFn: async () => {
      const r = await fetch(`/api/advance-payments?workerId=${worker.id}`);
      if (!r.ok) throw new Error("Failed to fetch advances");
      return r.json();
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments", worker.id],
    queryFn: async () => {
      const r = await fetch(`/api/payments?workerId=${worker.id}`);
      if (!r.ok) throw new Error("Failed to fetch payments");
      return r.json();
    }
  });

  const availableAdvance = advances
    .map((a: any) => Math.max(0, Number(a.amount) - Number(a.adjustedAmount || 0)))
    .reduce((s: number, v: number) => s + v, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Worker</div>
            <div className="text-lg font-semibold">{worker.name}</div>
            <div className="text-sm text-gray-600 capitalize">Type: {worker.type}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Balance</div>
            <div className="text-lg font-bold">₹{Number(worker.balance).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Advance Available: ₹{availableAdvance.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-3">
          <div className="space-y-3">
            {weeks.map((w, idx) => {
              const weekAtt = attendanceData[idx] || [];
              const days = weekAtt.length;
              const present = weekAtt.filter((a: any) => a.isPresent).length;
              const bricks = weekAtt.reduce((s: number, a: any) => s + (a.bricksProduced || 0), 0);
              return (
                <Card key={idx}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">{w.label}</div>
                      <div className="text-xs text-gray-500">Records: {days}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Present: {present}</div>
                      {worker.type === 'karagir' && (
                        <div className="text-sm">Bricks: {bricks.toLocaleString()}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="advances" className="mt-3">
          <div className="space-y-2 max-h-64 overflow-auto">
            {advances.length === 0 && (
              <div className="text-sm text-gray-500">No advances</div>
            )}
            {advances.map((a: any) => (
              <Card key={a.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm">₹{Number(a.amount).toFixed(2)} {a.reason ? `- ${a.reason}` : ''}</div>
                    <div className="text-xs text-gray-500">{new Date(a.paymentDate).toLocaleString()}</div>
                  </div>
                  <div className="text-right text-xs text-gray-600">Adjusted: ₹{Number(a.adjustedAmount || 0).toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-3">
          <div className="space-y-2 max-h-64 overflow-auto">
            {payments.length === 0 && (
              <div className="text-sm text-gray-500">No payments</div>
            )}
            {payments.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-3 grid grid-cols-3 gap-2 items-center">
                  <div>
                    <div className="text-sm font-medium">Paid ₹{Number(p.paidAmount).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">Gross: ₹{Number(p.grossAmount).toFixed(2)}</div>
                  <div className="text-right text-sm">Balance: ₹{Number(p.balanceAmount).toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


