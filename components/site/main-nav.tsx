"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "cn";
import { Menu, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav } from "@/lib/site";

// Links with a query string share a pathname with another item, so they never show as active.
const isActive = (pathname: string | null, href: string) =>
  !!pathname && !href.includes("?") && (pathname === href || pathname.startsWith(`${href}/`));

function Links({ pathname, mobile }: { pathname: string | null; mobile?: boolean }) {
  return (
    <ul className={mobile ? "flex flex-col" : "flex items-center"}>
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);
        const link = (
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center rounded-md font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              mobile ? "min-h-11 px-3 text-base" : "px-2.5 py-2 text-sm xl:px-3",
              active && "text-primary shadow-[inset_0_-2px_0_var(--brand-red)]"
            )}
          >
            {item.label}
          </Link>
        );
        return <li key={item.href}>{mobile ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
      })}
    </ul>
  );
}

function ActiveLinks({ mobile }: { mobile?: boolean }) {
  return <Links pathname={usePathname()} mobile={mobile} />;
}

// usePathname suspends on routes whose dynamic params are unknown at build time (Cache Components),
// so the fallback renders the same links without an active state.
function NavLinks({ mobile }: { mobile?: boolean }) {
  return (
    <Suspense fallback={<Links pathname={null} mobile={mobile} />}>
      <ActiveLinks mobile={mobile} />
    </Suspense>
  );
}

export function DesktopNav() {
  return (
    <nav aria-label="Menu chính" className="hidden lg:block">
      <NavLinks />
    </nav>
  );
}

export function MobileNav({ hotline }: { hotline: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Mở menu">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs overflow-y-auto" aria-describedby={undefined}>
        <SheetTitle className="px-4 pt-5 text-lg">Menu</SheetTitle>
        <Form action="/tim-kiem" role="search" className="flex gap-2 px-4" onSubmit={() => setOpen(false)}>
          <label htmlFor="mobile-search" className="sr-only">
            Từ khóa tìm kiếm
          </label>
          <Input id="mobile-search" name="q" type="search" placeholder="Tìm kiếm…" className="h-11" />
          <Button type="submit" size="icon" className="size-11 shrink-0" aria-label="Tìm kiếm">
            <Search className="size-5" />
          </Button>
        </Form>
        <nav aria-label="Menu chính" className="px-2">
          <NavLinks mobile />
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t px-2 py-4">
          <a href={`tel:${hotline.replace(/[^\d+]/g, "")}`} className="flex min-h-11 items-center gap-2 rounded-md px-3 font-medium hover:bg-accent">
            <Phone aria-hidden className="size-4" />
            Hotline: {hotline}
          </a>
          <SheetClose asChild>
            <Link href="/admin/login" className="flex min-h-11 items-center rounded-md px-3 text-muted-foreground hover:bg-accent">
              Đăng nhập quản trị
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
