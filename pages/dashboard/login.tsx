import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useArtists } from "@/context/mainContext";

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email("Érvénytelen email cím")
        .required("Az email cím megadása kötelező"),
    password: yup
        .string()
        .required("A jelszó megadása kötelező"),
});

export default function Login() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { callbackUrl } = router.query;
    const { artists, setSelectedArtist } = useArtists();

    useEffect(() => {
        if (status === "authenticated" && session) {
            if (callbackUrl && typeof callbackUrl === 'string') {
                router.push(callbackUrl);
            } else if (artists && artists.length > 0) {
                const firstArtist = artists[0];
                setSelectedArtist(firstArtist._id);
                router.push(`/dashboard/${firstArtist._id}/profile`);
            } else {
                router.push("/dashboard");
            }
        }
    }, [status, session, router, callbackUrl, artists, setSelectedArtist]);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const result = await signIn("credentials", {
                    redirect: false,
                    email: values.email,
                    password: values.password,
                    callbackUrl: (callbackUrl as string) || "/dashboard",
                });

                if (result?.error) {
                    toast.error("Hiba történt!", {
                        description: result.error,
                    });
                } else if (result?.url) {
                    toast.success("Sikeres bejelentkezés!");
                    router.push(result.url);
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "A bejelentkezés sikertelen volt";
                toast.error("Hiba történt!", {
                    description: errorMessage,
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Betöltés...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster richColors position="top-center" closeButton />
            <div className="flex min-h-screen flex-1 bg-white">
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                    <div className="mx-auto w-full max-w-sm lg:w-96">
                        <div>
                            <Image
                                alt="Your Company"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                width={40}
                                height={40}
                                className="h-10 w-auto"
                            />
                            <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">
                                Jelentkezz be a fiókodba
                            </h2>
                            <p className="mt-2 text-sm/6 text-gray-500">
                                Még nincs fiókod?{" "}
                                <Link href="/dashboard/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Regisztrálj
                                </Link>
                            </p>
                        </div>

                        <div className="mt-10">
                            <form onSubmit={formik.handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                        Email cím
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
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
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        Jelszó
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            placeholder="••••••••"
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
                                    <button
                                        type="submit"
                                        disabled={formik.isSubmitting}
                                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {formik.isSubmitting ? "Bejelentkezés..." : "Bejelentkezés"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="relative hidden w-0 flex-1 lg:block">
                    <Image
                        alt=""
                        src="https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        width={1908}
                        height={1272}
                        className="absolute inset-0 size-full object-cover"
                    />
                </div>
            </div>
        </>
    );
}
