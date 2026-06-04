import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
};

const Login = () => {
  const navigate = useNavigate();
  const { login, token, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: ""
    }
  });

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate, token]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <section className="panel w-full max-w-md p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Preproute</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Test Management System</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in with your admin credentials.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input label="User ID" autoComplete="username" error={errors.userId} {...register("userId")} />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password}
            {...register("password")}
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Login;
