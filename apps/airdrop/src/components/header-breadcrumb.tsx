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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Krain Airdrop</BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) =>
          path === "" ? null : (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={paths.slice(0, index + 1).join("/")}>
                    {capitalizeEachWord(path)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ),
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
