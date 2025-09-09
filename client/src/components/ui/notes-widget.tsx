import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function NotesWidget() {
  const { data: notes = [], refetch } = useQuery({ queryKey: ["/api/notes"] });
  const [text, setText] = useState("");

  const addNote = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      return res.json();
    },
    onSuccess: () => {
      setText("");
      refetch();
    }
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  return (
    <Card className="bg-white">
      <CardContent className="p-4 space-y-3">
        <div className="flex space-x-2">
          <Input
            placeholder="Quick note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) addNote.mutate();
            }}
          />
          <Button onClick={() => addNote.mutate()} disabled={!text.trim() || addNote.isPending}>Add</Button>
        </div>
        <div className="max-h-56 overflow-auto space-y-2">
          {notes.map((n: any) => (
            <div key={n.id} className="text-sm text-gray-800 border-b pb-1 flex items-start justify-between">
              <span className="pr-2 whitespace-pre-wrap break-words">{n.content}</span>
              <button
                className="text-gray-400 hover:text-red-600 p-1"
                aria-label="Delete note"
                onClick={() => deleteNote.mutate(n.id)}
                title="Delete"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-sm text-gray-500">No notes yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


