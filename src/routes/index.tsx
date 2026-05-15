import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/home/HomePage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicRoute from "../components/auth/PublicRoute";
import FranchiseList from "../pages/franchise/FranchiseList";
import FranchiseFormPage from "../pages/franchise/FranchiseFormPage";
import StudentList from "../pages/student/StudentList";
import StudentFormPage from "../pages/student/StudentFormPage";
import MCQCategory from "../pages/category/MCQCategory";
import McqQuestionAnsListPage from "../pages/mcq/McqQuestionAnsListPage";
import UpsertMcqQuestionAnsPage from "../pages/mcq/UpsertMcqQuestionAnsPage";
import TestListPage from "../pages/test/TestListPage";
import UpsertTestPage from "../pages/test/UpsertTestPage";
import DisplayViewListPage from "../pages/display-view/DisplayViewListPage";
import UpsertDisplayViewPage from "../pages/display-view/UpsertDisplayViewPage";
import PracticeHomePage from "../pages/practice/PracticeHomePage";
import PracticeBrowsePage from "../pages/practice/PracticeBrowsePage";
import PracticeTestPage from "../pages/practice/PracticeTestPage";
import PracticeResultPage from "../pages/practice/PracticeResultPage";


export const router = createBrowserRouter([
    // Protected Routes
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />
                    },
                    {
                        path: "franchise",
                        children: [
                            {
                                index: true,
                                element: <FranchiseList />
                            },
                            {
                                path: "create",
                                element: <FranchiseFormPage />
                            },
                            {
                                path: "edit/:id",
                                element: <FranchiseFormPage />
                            }
                        ]
                    },
                    {
                        path: "student",
                        children: [
                            {
                                index: true,
                                element: <StudentList />
                            },
                            {
                                path: "create",
                                element: <StudentFormPage />
                            }
                        ]
                    },
                    {
                        path: "category",
                        children: [
                            {
                                index: true,
                                element: <MCQCategory />
                            }
                        ]
                    },
                    {
                        path: "question-ans",
                        children: [
                            {
                                index: true,
                                element: <McqQuestionAnsListPage />
                            },
                            {
                                path: "create",
                                element: <UpsertMcqQuestionAnsPage />
                            },
                            {
                                path: "edit/:id",
                                element: <UpsertMcqQuestionAnsPage />
                            }
                        ]
                    },
                    {
                        path: "test",
                        children: [
                            {
                                index: true,
                                element: <TestListPage />
                            },
                            {
                                path: "create",
                                element: <UpsertTestPage />
                            },
                            {
                                path: "edit/:id",
                                element: <UpsertTestPage />
                            }
                        ]
                    },
                    {
                        path: "display-view",
                        children: [
                            {
                                index: true,
                                element: <DisplayViewListPage />
                            },
                            {
                                path: "create",
                                element: <UpsertDisplayViewPage />
                            },
                            {
                                path: "edit/:id",
                                element: <UpsertDisplayViewPage />
                            }
                        ]
                    },
                    {
                        path: "practice",
                        children: [
                            {
                                index: true,
                                element: <PracticeHomePage />
                            },
                            {
                                path: ":nodeId",
                                element: <PracticeBrowsePage />
                            },
                            {
                                path: "test/:testId",
                                element: <PracticeTestPage />
                            },
                            {
                                path: "result/:testId",
                                element: <PracticeResultPage />
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // Public Auth Routes
    {
        element: <PublicRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "login",
                        element: <LoginPage />
                    },
                    {
                        path: "register",
                        element: <RegisterPage />
                    }
                ]
            }
        ]
    },
    // Fallback redirect
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
])
