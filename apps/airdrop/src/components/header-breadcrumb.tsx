"use client";

import { usePathname } from "next/navigation";
import { capitalizeEachWord } from "@repo/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/components/ui/breadcrumb";
import { Fragment } from "react";
import Link from "next/link";
export default function HeaderBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/");
  console.log(paths);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => {
          console.log(path, index);
          return index === 0 ? null : (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${path}`}>
                    {capitalizeEachWord(path === "" ? "Dashboard" : path)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
