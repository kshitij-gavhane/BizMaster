import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  CalendarCheck, 
  Factory, 
  Package,
  ArrowUp,
  AlertTriangle 
} from "lucide-react";
import NotesWidget from "@/components/ui/notes-widget";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  // Fetch sales orders to build weekly sales chart
  const { data: salesOrders = [] } = useQuery({
    queryKey: ["/api/sales-orders"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const attendanceRate = metrics?.todayAttendance 
    ? ((metrics.todayAttendance.present / metrics.todayAttendance.total) * 100).toFixed(1)
    : "0";

  // Build last 7 days labels
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return { key, label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
  });

  // Aggregate sales (quantity) per day
  const salesByDate: Record<string, number> = {};
  for (const { key } of days) salesByDate[key] = 0;
  salesOrders.forEach((o: any) => {
    const date = o.orderDate;
    if (date && salesByDate[date] !== undefined) {
      salesByDate[date] += Number(o.quantity || 0);
    }
  });

  const chartData = days.map(({ key, label }) => ({
    date: label,
    sales: salesByDate[key] || 0,
  }));

  const chartConfig = {
    sales: {
      label: "Bricks Sold",
      color: "hsl(221.2 83.2% 53.3%)",
    },
  } as const;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white" data-testid="card-total-workers">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Workers</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-total-workers">
                  {metrics?.totalWorkers || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                12%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-attendance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-attendance">
                  {metrics?.todayAttendance.present || 0}/{metrics?.todayAttendance.total || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarCheck className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">{attendanceRate}%</span>
              <span className="text-gray-500 ml-2">attendance rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-production">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Weekly Production</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-production">
                  {metrics?.weeklyProduction?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Factory className="text-orange-600 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">bricks produced</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-inventory">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inventory Level</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-inventory">
                  {metrics?.inventoryLevel?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="text-purple-600 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {(metrics?.inventoryLevel || 0) < 1000000 && (
                <span className="text-yellow-600 flex items-center">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Low stock
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart */}
        <Card className="bg-white lg:col-span-2" data-testid="card-weekly-sales-chart">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Sales</h3>
            <ChartContainer config={chartConfig} className="w-full h-64">
              <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-sales)"
                  fill="var(--color-sales)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </AreaChart>
            </ChartContainer>
            <ChartLegend content={<ChartLegendContent nameKey="sales" />} />
          </CardContent>
        </Card>

        {/* Quick Notes */}
        <NotesWidget />

        {/* Recent Orders */}
        <Card className="bg-white" data-testid="card-recent-orders">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {metrics?.recentOrders?.length > 0 ? (
                metrics.recentOrders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-100"
                    data-testid={`order-item-${index}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900" data-testid={`text-customer-${index}`}>
                        Customer Order
                      </p>
                      <p className="text-sm text-gray-500" data-testid={`text-order-number-${index}`}>
                        {order.orderNumber}
                      </p>
                      {order.notes && (
                        <p className="text-xs text-gray-500 mt-1" data-testid={`text-order-notes-${index}`}>
                          Notes: {order.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900" data-testid={`text-quantity-${index}`}>
                        {order.quantity.toLocaleString()} bricks
                      </p>
                      <span 
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        data-testid={`status-${index}`}
                      >
                        {order.status === 'delivered' ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500" data-testid="no-orders">
                  No recent orders found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
