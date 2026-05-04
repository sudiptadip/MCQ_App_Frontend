import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ActionButton from '../../franchise/components/ActionButton';
import { Eye, Plus } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import type { User as Student } from '../../../types/database/User';
import { getStudents } from '../api/student.api';
import Error from '../../../components/common/Error';

const StudentTable = () => {
    const navigate = useNavigate();

    const columns: ColumnDef<Student>[] = [
        {
            accessorKey: "id",
            header: "#",
            size: 60,
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: "Student Name",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ getValue }) => (
                <a
                    href={`mailto:${getValue<string>()}`}
                    className="text-primary underline-offset-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {getValue<string>()}
                </a>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Joined",
            cell: ({ getValue }) =>
                getValue<string>() ? new Date(getValue<string>()).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }) : "N/A",
        },
        {
            id: "__actions__",
            header: "Actions",
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <ActionButton title="View" onClick={() => alert(`View: ${row.original.name}`)}>
                        <Eye size={14} />
                    </ActionButton>
                </div>
            ),
        },
    ];

    const { 
        data: students = [], 
        isLoading, 
        isError, 
        refetch 
    } = useQuery({
        queryKey: ['students'],
        queryFn: getStudents
    });

    if (isError) {
        return (
            <div className="p-6">
                <Error 
                    title="Students not found" 
                    message="There was an error fetching the student list." 
                    onRetry={() => refetch()} 
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <DataTable
                data={students}
                isLoading={isLoading}
                columns={columns}
                title="Student Management"
                description="List of all registered students."
                enableSorting
                enableSearch
                searchPlaceholder="Search student name or email..."
                enablePagination
                defaultPageSize={10}
                enableExcelExport
                exportFileName="student-list"
                enableColumnVisibility
                onRowClick={(row) => console.log("Row clicked:", row)}
                toolbarActions={
                    <button
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                        onClick={() => navigate("/student/create")}
                    >
                        <Plus size={14} />
                        Add Student
                    </button>
                }
            />
        </div>
    );
}

export default StudentTable;