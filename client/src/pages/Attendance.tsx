import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Edit } from "lucide-react";
import AttendanceForm from "@/components/forms/AttendanceForm";
import type { Worker, Attendance } from "@shared/schema";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);

  const { data: workers = [] } = useQuery({
    queryKey: ["/api/workers"],
  });

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["/api/attendance", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
  });

  const presentCount = attendance.filter((a: Attendance) => a.isPresent).length;
  const totalWorkers = workers.length;
  const attendanceRate = totalWorkers > 0 ? ((presentCount / totalWorkers) * 100).toFixed(1) : "0";

  // Create attendance map for quick lookup
  const attendanceMap = new Map(attendance.map((a: Attendance) => [a.workerId, a]));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
            data-testid="input-attendance-date"
          />
          <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="button-mark-attendance">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Mark Attendance - {new Date(selectedDate).toLocaleDateString()}</DialogTitle>
              </DialogHeader>
              <AttendanceForm 
                date={selectedDate}
                workers={workers}
                existingAttendance={attendance}
                onSuccess={() => setShowAttendanceForm(false)}
                onCancel={() => setShowAttendanceForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-sm text-gray-500" data-testid="text-attendance-date">
          Attendance for: <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance List */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h3>
              <div className="space-y-4">
                {workers.length > 0 ? (
                  workers.map((worker: Worker) => {
                    const workerAttendance = attendanceMap.get(worker.id);
                    const isPresent = workerAttendance?.isPresent || false;
                    
                    return (
                      <div 
                        key={worker.id} 
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        data-testid={`attendance-row-${worker.id}`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900" data-testid={`text-worker-name-${worker.id}`}>
                              {worker.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {worker.type === 'rojdaar' ? 'Rojdaar' : 'Karagir'} | ID: {worker.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            className={isPresent ? 'erp-badge-present' : 'erp-badge-absent'}
                            data-testid={`badge-status-${worker.id}`}
                          >
                            {isPresent ? 'Present' : 'Absent'}
                          </Badge>
                          {worker.type === 'karagir' && workerAttendance && (
                            <span className="text-sm text-gray-600" data-testid={`text-bricks-${worker.id}`}>
                              {workerAttendance.bricksProduced || 0} bricks
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAttendanceForm(true)}
                            data-testid={`button-edit-attendance-${worker.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500" data-testid="no-workers">
                    No workers found. Add workers first to mark attendance.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Summary */}
        <div>
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Workers</span>
                  <span className="font-medium" data-testid="text-total-workers">{totalWorkers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="font-medium text-green-600" data-testid="text-present-count">{presentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="font-medium text-red-600" data-testid="text-absent-count">{totalWorkers - presentCount}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="font-medium" data-testid="text-attendance-rate">{attendanceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
