import { getAllLearningModules } from "@/lib/learning/actions";
import { getModuleQuizzes } from "@/features/learning-module/actions/quiz-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuizActions } from "@/components/admin/quiz-actions-menu";

export default async function AdminQuizzesPage() {
  const modules = await getAllLearningModules();

  const quizData = await Promise.all(
    modules.map(async (mod) => {
      const quizzes = await getModuleQuizzes(mod.id);
      return {
        moduleId: mod.id,
        moduleName: mod.title,
        quizzes: quizzes,
      };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Quiz Management</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Quiz Title</TableHead>
              <TableHead>Passing Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizData.flatMap((item) =>
              item.quizzes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{item.moduleName}</TableCell>
                  <TableCell>{q.title}</TableCell>
                  <TableCell>{q.passingGrade}%</TableCell>
                  <TableCell>
                    <Badge variant={q.isPublished ? "default" : "secondary"}>
                      {q.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <QuizActions quizConfigId={q.id} moduleId={item.moduleId} />
                  </TableCell>
                </TableRow>
              ))
            )}
            {quizData.every((item) => item.quizzes.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No quizzes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
