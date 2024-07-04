/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const { execSync } = require("child_process")

// Define the template for blog post
const blogPost = path.resolve(`./src/templates/blog-post.js`)

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: ASC } }, limit: 10000) {
        nodes {
          id
          fields {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const posts = result.data.allMarkdownRemark.nodes

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    // Existing code for creating slug
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })

    // New code for adding Git commit time
    try {
      const gitCommitTime = execSync(
        `git log -1 --format=%cI ${node.fileAbsolutePath}`
      )
        .toString()
        .trim()

      createNodeField({
        node,
        name: `gitCommitTime`,
        value: gitCommitTime || new Date().toISOString(),
      })
    } catch (error) {
      console.warn(
        `Failed to get Git commit time for ${node.fileAbsolutePath}:`,
        error
      )
      createNodeField({
        node,
        name: `gitCommitTime`,
        value: new Date().toISOString(),
      })
    }
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
      wishes: [Wish]
      selectedValues: SelectedValues
    }

    type Wish {
      id: String
      text: String
      rating: Int
    }

    type SelectedValues {
      recipients: String
      holidays: String
      professions: String
      style: String
    }

    type Fields {
      slug: String
      gitCommitTime: Date @dateformat
    }
  `)
}
