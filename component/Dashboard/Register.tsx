import Link from "next/link";
import { useState } from "react";
import registerUser from "@/service/auth.service";
import * as yup from "yup";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useRouter } from "next/router";

interface RegisterFormValues {
    name: string;
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
}

const registerSchema = yup.object().shape({
  name: yup.string().required("A név megadása kötelező"),
  email: yup
    .string()
    .email("Érvénytelen email cím")
    .required("Az email cím megadása kötelező"),
  confirmEmail: yup
    .string()
    .oneOf([yup.ref("email")], "Az email címek nem egyeznek")
    .required("Az email cím megerősítése kötelező"),
  password: yup
    .string()
    .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie")
    .matches(/[A-Z]/, "A jelszónak tartalmaznia kell nagybetűt")
    .matches(/[a-z]/, "A jelszónak tartalmaznia kell kisbetűt")
    .matches(/[0-9]/, "A jelszónak tartalmaznia kell számot")
    .required("A jelszó megadása kötelező"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "A jelszavak nem egyeznek")
    .required("A jelszó megerősítése kötelező"),
}) as yup.ObjectSchema<RegisterFormValues>;

export default function Register() {
    const router = useRouter();
    const formik = useFormik<RegisterFormValues>({
        initialValues: {
            name: "",
            email: "",
            confirmEmail: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: registerSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const result = await registerUser({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                });

                toast.success("Sikeres regisztráció!", {
                    description: "Most már bejelentkezhetsz az oldalra.",
                });
                
                // Wait for the toast to be visible before redirecting
                setTimeout(() => {
                    router.push("/dashboard/login");
                }, 150);

            } catch (error: any) {
                toast.error("Hiba történt!", {
                    description: error.message || "A regisztráció sikertelen volt. Kérjük próbáld újra.",
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <>
            {/*
              This example requires updating your template:
    
              ```
              <html class="h-full bg-white">
              <body class="h-full">
              ```
            */}
            <div className="flex flex-row-reverse min-h-screen flex-1">
              <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                  <div>
                    <img
                      alt="Your Company"
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-10 w-auto"
                    />
                    <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-sm/6 text-gray-500">
                      Are you already a member?{' '}
                      <Link href="/dashboard/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign in
                      </Link>
                    </p>
                  </div>
    
                  <div className="mt-10">
                    <div>
                      <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                            Name
                          </label>
                          <div className="mt-2">
                            <input
                              id="name"
                              name="name"
                              type="text"
                              required
                              placeholder="Enter your full name"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.name}
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {formik.touched.name && formik.errors.name && (
                              <div className="text-red-600 text-sm mt-1">{formik.errors.name}</div>
                            )}
                          </div>
                        </div>
    
                        <div>
                          <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                          </label>
                          <div className="mt-2">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              placeholder="you@example.com"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.email}
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {formik.touched.email && formik.errors.email && (
                              <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
                            )}
                          </div>
                        </div>
    
                        <div>
                          <label htmlFor="confirmEmail" className="block text-sm/6 font-medium text-gray-900">
                            Confirm Email address
                          </label>
                          <div className="mt-2">
                            <input
                              id="confirmEmail"
                              name="confirmEmail"
                              type="email"
                              required
                              placeholder="Confirm your email address"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.confirmEmail}
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {formik.touched.confirmEmail && formik.errors.confirmEmail && (
                              <div className="text-red-600 text-sm mt-1">{formik.errors.confirmEmail}</div>
                            )}
                          </div>
                        </div>
    
                        <div>
                          <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            Password
                          </label>
                          <div className="mt-2">
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              placeholder="Create a strong password"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.password}
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {formik.touched.password && formik.errors.password && (
                              <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
                            )}
                          </div>
                        </div>
    
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-900">
                            Confirm Password
                          </label>
                          <div className="mt-2">
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              required
                              placeholder="Confirm your password"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.confirmPassword}
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                              <div className="text-red-600 text-sm mt-1">{formik.errors.confirmPassword}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {formik.isSubmitting ? "Regisztráció..." : "Regisztráció"}
                          </button>
                        </div>
                      </form>
                    </div>
    
                    {/* <div className="mt-10">
                      <div className="relative">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm/6 font-medium">
                          <span className="bg-white px-6 text-gray-900">Or continue with</span>
                        </div>
                      </div>
    
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <a
                          href="#"
                          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                            <path
                              d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                              fill="#EA4335"
                            />
                            <path
                              d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                              fill="#4285F4"
                            />
                            <path
                              d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                              fill="#34A853"
                            />
                          </svg>
                          <span className="text-sm/6 font-semibold">Google</span>
                        </a>
    
                        <a
                          href="#"
                          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="size-5 fill-[#24292F]">
                            <path
                              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                              clipRule="evenodd"
                              fillRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm/6 font-semibold">GitHub</span>
                        </a>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="relative hidden w-0 flex-1 lg:block">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            </div>
          </>
        )
      }
      