import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "app/(marketing)/blog/posts");

interface PostData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  contentHtml: string;
  readingTime: {
    text: string;
  };
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ""),
  }));
}

export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      tags: data.tags || [],
      contentHtml: "", // Placeholder
      readingTime: readingTime(content),
    } as PostData;
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Remove the main title (first H1) from the content before processing
  let contentWithoutTitle = content;
  const lines = content.trim().split("\n");
  if (lines.length > 0 && lines[0].trim().startsWith("# ")) {
    // Assumes the title is the first non-empty line and an H1
    contentWithoutTitle = lines.slice(1).join("\n");
  }

  // Process the content *without* the title
  const processedContent = await remark()
    .use(html)
    .process(contentWithoutTitle); // Use contentWithoutTitle here
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    tags: data.tags || [],
    contentHtml,
    readingTime: readingTime(content),
  } as PostData;
}
