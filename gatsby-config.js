module.exports = {
  siteMetadata: {
    title: 'wadackel.me',
    description:
      'wadackel.me は、わだ つよし (@wadackel) の技術×プライベートなブログです。ダックスフンド is かわいい。',
    siteUrl: 'https://blog.wadackel.me',
    social: {
      twitter: 'wadackel',
      github: 'wadackel',
    },
  },
  plugins: [
    'gatsby-plugin-preact',
    'gatsby-plugin-postcss',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/blog`,
        name: 'blog',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/assets`,
        name: 'assets',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              offsetY: 40,
              icon: '<span aria-hidden="true">#</span>',
              isIconAfterHeader: true,
            },
          },
          'gatsby-remark-copy-images',
          '@weknow/gatsby-remark-twitter',

          // local plugins
          'gatsby-remark-code',
          'gatsby-remark-image',
          'gatsby-remark-table',
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-76551157-1',
      },
    },
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/index.xml',
            title: 'blog.wadackel.me',
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'wadackel.me',
        short_name: 'wadackel.me',
        start_url: '/',
        background_color: '#fff',
        theme_color: '#fff',
        display: 'standalone',
        icons: [
          {
            src: '/icon144.png',
            type: 'image/png',
            sizes: '144x144',
          },
          {
            src: '/icon512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
      },
    },
    'gatsby-plugin-remove-generator',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-minify-classnames',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-typescript',
  ],
};
