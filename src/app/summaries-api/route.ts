"use server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const pathToSummaries = path.resolve("./public", "summaries");
  const filenames = fs.readdirSync(pathToSummaries);
  return Response.json([...filenames]);
}