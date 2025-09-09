import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: string;
  name: string;
  type: string;
}

export default function TripForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void; }) {
  const { toast } = useToast();
  const [driverId, setDriverId] = useState("");
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleType, setVehicleType] = useState("tractor");
  const [amountPerTrip, setAmountPerTrip] = useState("1000");
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  const { data: workers = [] } = useQuery({ queryKey: ["/api/workers"] });
  const drivers: Worker[] = workers.filter((w: Worker) => w.type === "driver");
  const nonDrivers: Worker[] = workers.filter((w: Worker) => w.type !== "driver");

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const createTrip = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, tripDate, vehicleType, amountPerTrip, participantIds }),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Trip recorded" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save trip", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-4" data-testid="form-trip">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Driver *</Label>
          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger>
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date *</Label>
          <Input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
        </div>
        <div>
          <Label>Vehicle Type *</Label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tractor">Tractor</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount per Trip (₹) *</Label>
          <Input type="number" step="0.01" value={amountPerTrip} onChange={(e) => setAmountPerTrip(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Label className="mb-2 block">Team Members</Label>
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-auto">
            {nonDrivers.map(w => (
              <label key={w.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={participantIds.includes(w.id)}
                  onChange={() => toggleParticipant(w.id)}
                />
                <span>{w.name} ({w.type})</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-trip">Cancel</Button>
        <Button onClick={() => createTrip.mutate()} disabled={!driverId || !tripDate || !vehicleType || !amountPerTrip || createTrip.isPending} data-testid="button-save-trip">
          {createTrip.isPending ? "Saving..." : "Save Trip"}
        </Button>
      </div>
    </div>
  );
}


