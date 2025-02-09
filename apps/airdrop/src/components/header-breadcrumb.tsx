"use client";

import { usePathname } from "next/navigation";
import { capitalizeEachWord } from "@krain/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@krain/ui/components/ui/breadcrumb";
import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HeaderBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x opacity-50 rounded-md" />
        {pathname === "/" ? (
          <BreadcrumbItem className="relative">
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="group relative px-2 py-1 no-underline hover:no-underline"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
                <span className="relative z-10 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                  Dashboard
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          paths.map((path, index) => (
            <Fragment key={`${path}-${index}`}>
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4 text-primary/50" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem className="relative">
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${paths.slice(0, index + 1).join("/")}`}
                    className="group relative px-2 py-1 no-underline hover:no-underline"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
                    <span className="relative z-10 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
                      {capitalizeEachWord(path)}
                    </span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
