import { MDXRemote } from "next-mdx-remote/rsc";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

function ContentLink({
  href = "",
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
        rel="noopener noreferrer"
        className="text-green underline"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="text-green underline">
      {children}
    </Link>
  );
}

const mdxComponents = {
  a: ContentLink,
};

export async function renderMdx(source: string): Promise<ReactNode> {
  return <MDXRemote source={source} components={mdxComponents} />;
}
