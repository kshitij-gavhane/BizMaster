import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileSpreadsheet, ArrowUp, ArrowDown, Package, Recycle, TrendingDown, BarChart3 } from "lucide-react";
import InventoryAdjustmentForm from "@/components/forms/InventoryAdjustmentForm";
import { useState } from "react";

export default function Inventory() {
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ["/api/inventory/movements"],
  });

  const isLoading = inventoryLoading || movementsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

  // Calculate weekly sales and burn rate
  const weeklyMovements = movements.filter((m: any) => {
    const moveDate = new Date(m.movementDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return moveDate >= weekAgo && m.type === 'sale';
  });
  
  const weeklySales = weeklyMovements.reduce((sum: number, m: any) => sum + Math.abs(m.quantity), 0);
  const burnRate = Math.round(weeklySales / 7);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Dialog open={showAdjustmentForm} onOpenChange={setShowAdjustmentForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="button-adjust-stock">
                <Plus className="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Manual Stock Adjustment</DialogTitle>
              </DialogHeader>
              <InventoryAdjustmentForm 
                onSuccess={() => setShowAdjustmentForm(false)}
                onCancel={() => setShowAdjustmentForm(false)}
              />
            </DialogContent>
          </Dialog>
          <Button className="bg-green-600 text-white hover:bg-green-700" data-testid="button-export-report">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        <div className="text-sm text-gray-500" data-testid="text-last-updated">
          Last Updated: <span className="font-medium">
            {inventory?.lastUpdated ? new Date(inventory.lastUpdated).toLocaleString() : 'Never'}
          </span>
        </div>
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-white" data-testid="card-current-stock">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Stock</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-current-stock">
                  {inventory?.currentStock?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="text-purple-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">bricks available</p>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-khanger-stock">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Khanger Stock</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-khanger-stock">
                  {inventory?.khangerStock?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Recycle className="text-orange-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">byproduct units</p>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-weekly-sales">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Weekly Sales</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-weekly-sales">
                  {weeklySales.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingDown className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">bricks sold</p>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-burn-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Burn Rate</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-burn-rate">
                  {burnRate.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <BarChart3 className="text-red-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">bricks/day avg</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement */}
        <Card className="bg-white" data-testid="card-stock-movements">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Stock Movements</h3>
            <div className="space-y-4">
              {movements.length > 0 ? (
                movements.slice(0, 10).map((movement: any, index: number) => (
                  <div 
                    key={movement.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-100"
                    data-testid={`movement-item-${index}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        movement.quantity < 0 ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {movement.quantity < 0 ? (
                          <ArrowDown className="text-red-600 h-4 w-4" />
                        ) : (
                          <ArrowUp className="text-green-600 h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900" data-testid={`text-movement-reason-${index}`}>
                          {movement.reason || `${movement.type.charAt(0).toUpperCase() + movement.type.slice(1)} Movement`}
                        </p>
                        <p className="text-xs text-gray-500" data-testid={`text-movement-type-${index}`}>
                          {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}`} data-testid={`text-movement-quantity-${index}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500" data-testid={`text-movement-date-${index}`}>
                        {new Date(movement.movementDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500" data-testid="no-movements">
                  No stock movements recorded yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Chart Placeholder */}
        <Card className="bg-white" data-testid="card-stock-chart">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Level Trends</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Stock Chart Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
