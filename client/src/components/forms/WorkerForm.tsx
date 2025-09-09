import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertWorkerSchema, type Worker, type InsertWorker } from "@shared/schema";
import { z } from "zod";

const workerFormSchema = insertWorkerSchema.extend({
  joinDate: z.string().min(1, "Join date is required"),
});

type WorkerFormData = z.infer<typeof workerFormSchema>;

interface WorkerFormProps {
  worker?: Worker;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WorkerForm({ worker, onSuccess, onCancel }: WorkerFormProps) {
  const { toast } = useToast();
  const isEditing = !!worker;

  const form = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: worker?.name || "",
      type: (worker?.type as "rojdaar" | "karagir") || "rojdaar",
      dailyWage: worker?.dailyWage || "",
      pieceRate: worker?.pieceRate || "",
      phone: worker?.phone || "",
      address: worker?.address || "",
      joinDate: worker?.joinDate || new Date().toISOString().split('T')[0],
      isActive: worker?.isActive ?? true,
    },
  });

  const workerType = form.watch("type");

  const createWorkerMutation = useMutation({
    mutationFn: async (data: InsertWorker) => {
      const response = await apiRequest("POST", "/api/workers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({ title: "Success", description: "Worker created successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create worker", 
        variant: "destructive" 
      });
      console.error("Create worker error:", error);
    },
  });

  const updateWorkerMutation = useMutation({
    mutationFn: async (data: Partial<Worker>) => {
      const response = await apiRequest("PUT", `/api/workers/${worker!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({ title: "Success", description: "Worker updated successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update worker", 
        variant: "destructive" 
      });
      console.error("Update worker error:", error);
    },
  });

  const onSubmit = (data: WorkerFormData) => {
    const workerData: InsertWorker = {
      name: data.name,
      type: data.type,
      dailyWage: data.type === "rojdaar" ? data.dailyWage : null,
      pieceRate: data.type === "karagir" ? data.pieceRate : null,
      phone: data.phone || null,
      address: data.address || null,
      joinDate: data.joinDate,
      isActive: data.isActive,
    };

    if (isEditing) {
      updateWorkerMutation.mutate(workerData);
    } else {
      createWorkerMutation.mutate(workerData);
    }
  };

  const isLoading = createWorkerMutation.isPending || updateWorkerMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-worker">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worker Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter worker name"
                    data-testid="input-worker-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worker Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} data-testid="select-worker-type">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="rojdaar">Rojdaar (Daily Wage)</SelectItem>
                    <SelectItem value="karagir">Karagir (Piece Rate)</SelectItem>
                    <SelectItem value="driver">Driver (Trip Based)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workerType === "rojdaar" && (
            <FormField
              control={form.control}
              name="dailyWage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Wage (₹) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      step="0.01"
                      placeholder="Enter daily wage"
                      data-testid="input-daily-wage"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {workerType === "karagir" && (
            <FormField
              control={form.control}
              name="pieceRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Piece Rate (₹ per brick) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      step="0.0001"
                      placeholder="Enter rate per brick"
                      data-testid="input-piece-rate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    placeholder="Enter phone number"
                    data-testid="input-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Join Date *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="date"
                  data-testid="input-join-date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter address"
                  rows={3}
                  data-testid="textarea-address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
            data-testid="button-cancel-worker"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading}
            data-testid="button-save-worker"
          >
            {isLoading ? "Saving..." : isEditing ? "Update Worker" : "Create Worker"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
