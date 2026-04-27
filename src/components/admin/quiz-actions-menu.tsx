"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getQuizWithQuestions, deleteQuiz } from "@/features/learning-module/actions/quiz-actions";
import { Eye, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { QuizWithQuestions } from "@/features/learning-module/types/quiz";
import { useRouter } from "next/navigation";

export function QuizActions({ quizConfigId, moduleId }: { quizConfigId: string, moduleId: string }) {
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const loadQuiz = async () => {
    setLoading(true);
    const data = await getQuizWithQuestions(quizConfigId);
    setQuiz(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    setIsDeleting(true);
    const result = await deleteQuiz(quizConfigId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete quiz");
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex justify-end gap-2">
      {/* Preview Dialog */}
      <Dialog onOpenChange={(open) => open && loadQuiz()}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{quiz?.config.title || "Loading Quiz..."}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div>Loading questions...</div>
          ) : (
            <div className="space-y-6">
              {quiz?.questions.map((q, index) => (
                <div key={q.id} className="border-b pb-4">
                  <p className="font-semibold">
                    {index + 1}. {q.questionText}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(q.options).map(([key, val]) => (
                      <li
                        key={key}
                        className={`p-2 rounded ${
                          key === q.correctAnswer ? "bg-green-100 font-bold" : ""
                        }`}
                      >
                        {key}: {val}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/learning/${moduleId}/quiz?quizId=${quizConfigId}`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Quiz
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Quiz
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
