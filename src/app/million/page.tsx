import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Million.js",
  description:
    "Shadcn table component with server side sorting, pagination, and filtering, built with Million.js",
};

export default function MillionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen container">
      <h1 className="text-3xl font-bold">Shadcn Table</h1>
      <p className="text-base text-muted-foreground">
        Under construction, please come back later.
      </p>
    </div>
  );
}
