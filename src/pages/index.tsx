/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { LoaderIcon } from "lucide-react";

const Home: NextPage = () => {
  const router = useRouter();

  const addProperty = api.main.newProperty.useMutation({
    onSuccess: async (data) => {
      await router.push(`/property/${data}`);
    },
    onError: (error) => {
      console.error(error);
      alert("Error creating property");
    },
  });

  return (
    <>
      <Head>
        <title>Property Evaluator</title>
        <meta
          name="description"
          content="A simple, opinionated way to evaluate potential real estate deals."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight underline decoration-[#a09d87] sm:text-[5rem]">
            <span className="">Property</span>{" "}
            <span className="text-[#1694db]">Evaluator</span>
          </h1>

          <Button
            disabled={addProperty.isLoading}
            onClick={() => addProperty.mutate()}
          >
            {addProperty.isLoading ? (
              <LoaderIcon className="h-4 w-4" />
            ) : (
              "New Property"
            )}
          </Button>
        </div>
        <div className="flex max-w-[10rem] flex-col items-center py-10 md:mt-10">
          <Link href={"https://masterdevs.com"}>
            <img
              src={"https://masterdevs.com/mdevs_cmyk.svg"}
              alt="MasterDevs Logo"
            />
          </Link>
        </div>
      </main>
    </>
  );
};

export default Home;
