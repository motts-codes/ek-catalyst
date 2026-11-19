import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

// BigCommerce cuts the plain-text summary at a character count, mid-word. Ask for a little more
// than the card shows, then end it on a whole word with an ellipsis. The limit is written into the
// query as a literal: passed as a GraphQL variable, BigCommerce ignores it and returns 120.
const SUMMARY_LIMIT = 220;

function tidySummary(text: string): string {
  const summary = text.trim();

  if (summary.length < SUMMARY_LIMIT - 1 || /[.!?]$/.test(summary)) return summary;

  const cut = summary.lastIndexOf(' ');
  const whole = (cut > 0 ? summary.slice(0, cut) : summary).replace(/[\s,;:–-]+$/, '');

  return `${whole}…`;
}

const BlogQuery = graphql(`
  query BlogQuery {
    site {
      content {
        blog {
          name
          description
          path
        }
      }
    }
  }
`);

const BlogPostsPageQuery = graphql(
  `
    query BlogPostsPageQuery(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $filters: BlogPostsFiltersInput
    ) {
      site {
        content {
          blog {
            posts(first: $first, after: $after, last: $last, before: $before, filters: $filters) {
              edges {
                node {
                  author
                  entityId
                  name
                  path
                  plainTextSummary(characterLimit: 220)
                  tags
                  publishedDate {
                    utc
                  }
                  thumbnailImage {
                    url: urlTemplate(lossy: true)
                    altText
                  }
                }
              }
              pageInfo {
                ...PaginationFragment
              }
            }
          }
        }
      }
    }
  `,
  [PaginationFragment],
);

interface BlogPostsFiltersInput {
  tag: string | null;
}

interface Pagination {
  limit: number;
  before: string | null;
  after: string | null;
}

export const getBlog = cache(async () => {
  const response = await client.fetch({
    document: BlogQuery,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.content.blog;
});

export const getBlogPosts = cache(
  async ({ tag, limit, before, after }: BlogPostsFiltersInput & Pagination) => {
    const filterArgs = tag ? { filters: { tags: [tag] } } : {};
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: BlogPostsPageQuery,
      variables: { ...filterArgs, ...paginationArgs },
      fetchOptions: { next: { revalidate } },
    });

    const { blog } = response.data.site.content;

    if (!blog) {
      return null;
    }

    const format = await getFormatter();

    return {
      pageInfo: blog.posts.pageInfo,
      posts: removeEdgesAndNodes(blog.posts).map((post) => ({
        id: String(post.entityId),
        author: post.author,
        content: tidySummary(post.plainTextSummary),
        date: format.dateTime(new Date(post.publishedDate.utc)),
        // The card label is the post's first tag, when it has one (most posts have none).
        label: post.tags[0],
        image: post.thumbnailImage
          ? {
              src: post.thumbnailImage.url,
              alt: post.thumbnailImage.altText,
            }
          : undefined,
        href: post.path,
        title: post.name,
      })),
    };
  },
);
