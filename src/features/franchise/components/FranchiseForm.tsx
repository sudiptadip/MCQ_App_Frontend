import { useState } from "react";
import { showToast } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import type Franchise from "../../../types/database/Franchise";

import { registerFranchise, upsertFranchise } from "../api/franchise.api";

const franchiseSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact_email: z.string().email("Invalid email address"),
  owner_name: z.string().min(2, "Owner name must be at least 2 characters"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (!data.id) {
    return !!data.password && data.password.length >= 6;
  }
  return true;
}, {
  message: "Password is required and must be at least 6 characters",
  path: ["password"],
}).refine((data) => {
  if (!data.id && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FranchiseFormData = z.infer<typeof franchiseSchema>;

interface FranchiseFormProps {
  initialData?: Franchise;
}

const FranchiseForm = ({ initialData }: FranchiseFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || "",
      contact_email: initialData?.contact_email || "",
      owner_name: initialData?.owner_name || "",
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (formData: FranchiseFormData) => {
      const payload: any = {
        name: formData.name,
        contact_email: formData.contact_email,
        owner_name: formData.owner_name,
        password: formData.password
      };

      if (isEditMode) {
        payload.id = formData.id;
      } else {
        payload.password = formData.password;
      }

      return upsertFranchise(payload);
    },
    onSuccess: async (data, variables) => {
      if (data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ["franchises"] });

        if (!isEditMode) {
          const fData = await registerFranchise({
            contact_email: variables.contact_email,
            name: variables.name,
            owner_name: variables.name,
            id: Number(data.data.id),
            password: variables.password
          })
          console.log(fData);
        }
        showToast.success(data?.message);
        // navigate("/franchise");
      } else {
        showToast.error(data?.message);
      }
    },
    onError: (error) => {
      showToast.apiErrorShow(error);
    }
  });

  const onSubmit = (data: FranchiseFormData) => {
    upsertMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle className="text-2xl font-bold">
            {isEditMode ? "Edit Franchise" : "Create New Franchise"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? `Updating details for ${initialData.name}`
              : "Fill in the details to register a new franchise partner."}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/franchise")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Franchise Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Franchise Name</Label>
              <Input
                id="name"
                placeholder="Enter franchise name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                placeholder="Enter owner name"
                {...register("owner_name")}
              />
              {errors.owner_name && (
                <p className="text-sm text-red-500">{errors.owner_name.message}</p>
              )}
            </div>

            {/* Contact Email */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="franchise@example.com"
                {...register("contact_email")}
              />
              {errors.contact_email && (
                <p className="text-sm text-red-500">{errors.contact_email.message}</p>
              )}
            </div>

            {!isEditMode && (
              <>
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending
                ? (isEditMode ? "Updating..." : "Creating...")
                : (isEditMode ? "Save Changes" : "Create Franchise")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/franchise")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FranchiseForm;
