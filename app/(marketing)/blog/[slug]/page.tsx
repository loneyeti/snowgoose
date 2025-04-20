import { format } from "date-fns";
import type { Metadata } from "next";
import { getAllPostSlugs, getPostData } from "@/app/_utils/blog/mdx";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

// Generate metadata dynamically based on the post slug
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const post = await getPostData(params.slug);
  return {
    title: `${post.title} | Snowgoose`,
    description: post.excerpt,
  };
}

const BlogPost = async ({ params }: BlogPostProps) => {
  const post = await getPostData(params.slug);

  return (
    // Apply section styling similar to marketing page
    <section className="bg-gray-900 py-24 sm:py-32">
      <article className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Styled heading */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
          {post.title}
        </h1>
        {/* Styled metadata */}
        <div className="text-base text-gray-400 mb-10">
          <time dateTime={post.date}>
            {format(new Date(post.date), "MMMM d, yyyy")}
          </time>{" "}
          • <span>{post.readingTime.text}</span>
        </div>
        {/* Styled content area - added prose-invert for dark theme */}
        <div
          className="prose lg:prose-lg prose-invert max-w-none prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white prose-blockquote:text-gray-300 prose-code:text-pink-400"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </section>
  );
};

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => ({ slug: path.slug }));
}

export default BlogPost;
