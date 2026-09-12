import { createFileRoute } from "@tanstack/react-router";
import { HavenApp } from "@/components/haven/app";

export const Route = createFileRoute("/")({ component: HavenApp });
