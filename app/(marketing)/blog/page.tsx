import Link from "next/link";
import { format } from "date-fns";
import { getSortedPostsData } from "@/app/_utils/blog/mdx";
import { ArrowRightIcon } from "@heroicons/react/24/outline"; // Import icon

const BlogList = async () => {
  const allPosts = getSortedPostsData();
  return (
    // Apply section styling similar to marketing page
    <section className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Styled heading */}
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            From the Blog
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Insights, updates, and thoughts on AI, development, and Snowgoose.
          </p>
        </div>

        {/* Styled list container */}
        <div className="space-y-12">
          {allPosts.map((post) => (
            // Card styling for each post
            <article
              key={post.slug}
              className="relative isolate flex flex-col gap-8 lg:flex-row p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-indigo-500 transition-colors duration-300"
            >
              <div className="flex flex-col sm:gap-y-1 w-full">
                {/* Post Title */}
                <h2 className="text-2xl font-semibold text-white group-hover:text-indigo-400 transition-colors duration-200">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" />{" "}
                    {/* Clickable overlay */}
                    {post.title}
                  </Link>
                </h2>
                {/* Metadata */}
                <div className="flex items-center gap-x-4 text-xs text-gray-400 mt-2 mb-4">
                  <time dateTime={post.date}>
                    {format(new Date(post.date), "MMMM d, yyyy")}
                  </time>
                  <span>• {post.readingTime.text}</span>
                </div>
                {/* Excerpt */}
                <p className="text-base leading-7 text-gray-300 flex-auto">
                  {post.excerpt}
                </p>
                {/* Read More Link */}
                <div className="mt-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 relative z-10" // z-10 to be above overlay
                  >
                    Read post
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList;
