/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import PropertyForm from "~/components/property-form";
import { api } from "~/utils/api";

export default function PropertyPage() {
  const router = useRouter();
  const id = router.query["id"] as string;
  const property = api.main.getProperty.useQuery({ id });

  if (property.isLoading) return <div>Loading...</div>;

  const p = property.data;

  if (!p) return <div>Not Found</div>;

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

          <PropertyForm {...p} />
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
}
