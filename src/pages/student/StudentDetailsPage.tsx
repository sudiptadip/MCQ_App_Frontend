import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StudentDetailsForm from "../../features/student/components/StudentDetailsForm";
import { getStudentDetailsByUserId } from "../../features/student/api/student.api";

const StudentDetailsPage = () => {
  const { userId } = useParams();
  const id = Number(userId);

  // Fetch student details if user ID is present
  const { data: student, isLoading, isError } = useQuery({
    queryKey: ["studentDetails", id],
    queryFn: () => getStudentDetailsByUserId(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-500">Error</h2>
        <p className="text-muted-foreground">Could not load student details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <StudentDetailsForm initialData={student || undefined} userId={id} />
    </div>
  );
};

export default StudentDetailsPage;
