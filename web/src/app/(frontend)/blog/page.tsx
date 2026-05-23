"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  thumbnail_url: string | null;
  web_url: string;
  publish_date: string;
  source: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/newsletter/posts");
        const data = await res.json();
        const mapped = (data.posts || []).map(
          (p: {
            id: string;
            title: string;
            subtitle: string;
            thumbnail_url: string | null;
            web_url: string;
            publish_date: string;
          }) => ({
            ...p,
            source: "Dispatch",
          }),
        );
        setPosts(mapped);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <section className="blog">
      <div className="blog__inner">
        <div className="blog__header">
          <h1>Blog</h1>
          <p>
            Insights, analysis, and updates from the Konative team on data
            center development and infrastructure markets.
          </p>
        </div>

        {loading ? (
          <p className="blog__loading">Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="blog__empty">
            <h2>Coming Soon</h2>
            <p>
              We&apos;re preparing our first articles. Subscribe to be the first
              to know when we publish.
            </p>
            <NewsletterSignup variant="inline" source="blog" />
          </div>
        ) : (
          <div className="blog__grid">
            {posts.map((post) => (
              <article key={post.id} className="blog__card">
                {post.thumbnail_url && (
                  <div className="blog__card-image">
                    <img src={post.thumbnail_url} alt={post.title} />
                  </div>
                )}
                <div className="blog__card-body">
                  <div className="blog__card-meta">
                    <span className="blog__card-source">{post.source}</span>
                    <time className="blog__card-date">
                      {new Date(post.publish_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <h3 className="blog__card-title">{post.title}</h3>
                  {post.subtitle && (
                    <p className="blog__card-excerpt">{post.subtitle}</p>
                  )}
                  <Link href={post.web_url} className="blog__card-link">
                    Read more &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
