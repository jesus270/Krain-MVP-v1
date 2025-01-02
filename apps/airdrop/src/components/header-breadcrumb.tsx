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

export default function HeaderBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathname === "/" ? (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          paths.map((path, index) => (
            <Fragment key={`${path}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${paths.slice(0, index + 1).join("/")}`}>
                    {capitalizeEachWord(path)}
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
