"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AiFillLock } from "react-icons/ai";
const SignInButton = () => {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="group relative inline-block overflow-hidden border border-indigo-600 px-8 py-3 focus:outline-none focus:ring"
    >
      <span className="absolute inset-y-0 left-0 w-[2px] bg-indigo-600 transition-all group-hover:w-full group-active:bg-indigo-500"></span>

      <span className="relative text-sm font-medium text-indigo-600 transition-colors group-hover:text-white">
        Sign in with Google
      </span>
    </button>
  );
};
const Page = () => {
  // get the session from the server side and redirect if user is logged in
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="h-screen overflow-hidden">
      <section className="">
        <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
          <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
            <img
              sizes="(max-width: 1023px) 100vw, 50vw"
              alt="Pattern"
              src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
              className=" inset-0 h-full w-full object-cover"
            />
          </aside>

          <main
            aria-label="Main"
            className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6"
          >
            <div className="max-w-xl lg:max-w-3xl">
              <div className="flex items-center ">
                <AiFillLock className="w-10 h-10" />
                <h1 className="text-4xl font-bold tracking-wide">Classified</h1>
              </div>

              <h1 className="mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">
                Welcome to Classified 🔐
              </h1>

              <p className="mt-4 leading-relaxed ">
                Please use your google account to access the site
              </p>
              <SignInButton />
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default Page;
