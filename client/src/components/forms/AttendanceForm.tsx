import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import type { Worker, Attendance, InsertAttendance } from "@shared/schema";

interface AttendanceFormProps {
  date: string;
  workers: Worker[];
  existingAttendance: Attendance[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface AttendanceData {
  workerId: string;
  isPresent: boolean;
  bricksProduced: number;
  notes: string;
}

export default function AttendanceForm({ 
  date, 
  workers, 
  existingAttendance, 
  onSuccess, 
  onCancel 
}: AttendanceFormProps) {
  const { toast } = useToast();

  // Initialize attendance data from existing records or defaults
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceData>>(() => {
    const data: Record<string, AttendanceData> = {};
    
    workers.forEach(worker => {
      const existing = existingAttendance.find(a => a.workerId === worker.id);
      data[worker.id] = {
        workerId: worker.id,
        isPresent: existing?.isPresent || false,
        bricksProduced: existing?.bricksProduced || 0,
        notes: existing?.notes || "",
      };
    });
    
    return data;
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecords: InsertAttendance[]) => {
      // Save all attendance records
      const promises = attendanceRecords.map(record => 
        apiRequest("POST", "/api/attendance", record)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Success", description: "Attendance saved successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to save attendance", 
        variant: "destructive" 
      });
      console.error("Save attendance error:", error);
    },
  });

  const updateAttendanceData = (workerId: string, field: keyof AttendanceData, value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const attendanceRecords: InsertAttendance[] = Object.values(attendanceData).map(data => ({
      workerId: data.workerId,
      date,
      isPresent: data.isPresent,
      bricksProduced: data.bricksProduced,
      notes: data.notes || null,
    }));

    saveAttendanceMutation.mutate(attendanceRecords);
  };

  const presentCount = Object.values(attendanceData).filter(a => a.isPresent).length;
  const totalBricks = Object.values(attendanceData)
    .filter(a => a.isPresent)
    .reduce((sum, a) => sum + a.bricksProduced, 0);

  return (
    <div className="space-y-6" data-testid="form-attendance">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600" data-testid="text-present-summary">
            {presentCount}
          </div>
          <div className="text-sm text-gray-500">Present</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-600" data-testid="text-absent-summary">
            {workers.length - presentCount}
          </div>
          <div className="text-sm text-gray-500">Absent</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600" data-testid="text-bricks-summary">
            {totalBricks}
          </div>
          <div className="text-sm text-gray-500">Bricks</div>
        </div>
      </div>

      {/* Worker Attendance List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {workers.map((worker) => {
          const attendance = attendanceData[worker.id];
          
          return (
            <Card key={worker.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900" data-testid={`text-worker-name-${worker.id}`}>
                        {worker.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={worker.type === 'rojdaar' ? 'erp-badge-rojdaar' : 'erp-badge-karagir'}>
                          {worker.type === 'rojdaar' ? 'Rojdaar' : 'Karagir'}
                        </Badge>
                        <span className="text-sm text-gray-500">ID: {worker.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`present-${worker.id}`} className="text-sm">
                      Present
                    </Label>
                    <Switch
                      id={`present-${worker.id}`}
                      checked={attendance.isPresent}
                      onCheckedChange={(checked) => 
                        updateAttendanceData(worker.id, 'isPresent', checked)
                      }
                      data-testid={`switch-present-${worker.id}`}
                    />
                  </div>
                </div>

                {attendance.isPresent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {worker.type === 'karagir' && (
                      <div>
                        <Label htmlFor={`bricks-${worker.id}`} className="text-sm font-medium">
                          Bricks Produced
                        </Label>
                        <Input
                          id={`bricks-${worker.id}`}
                          type="number"
                          min="0"
                          value={attendance.bricksProduced}
                          onChange={(e) => 
                            updateAttendanceData(worker.id, 'bricksProduced', parseInt(e.target.value) || 0)
                          }
                          placeholder="Enter brick count"
                          className="mt-1"
                          data-testid={`input-bricks-${worker.id}`}
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor={`notes-${worker.id}`} className="text-sm font-medium">
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id={`notes-${worker.id}`}
                        value={attendance.notes}
                        onChange={(e) => 
                          updateAttendanceData(worker.id, 'notes', e.target.value)
                        }
                        placeholder="Add any notes..."
                        rows={2}
                        className="mt-1"
                        data-testid={`textarea-notes-${worker.id}`}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {workers.length === 0 && (
        <div className="text-center py-8 text-gray-500" data-testid="no-workers-attendance">
          No workers available to mark attendance
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={saveAttendanceMutation.isPending}
          data-testid="button-cancel-attendance"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={saveAttendanceMutation.isPending || workers.length === 0}
          data-testid="button-save-attendance"
        >
          {saveAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
}
