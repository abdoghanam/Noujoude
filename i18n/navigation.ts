import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, usePathname, redirect, useRouter, getPathname } =
  createNavigation(routing);
