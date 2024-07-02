import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPostTemplate = ({
  data: { previous, next, site, markdownRemark: post },
  location,
}) => {
  const slug = location.pathname.split("/").filter(Boolean).pop()
  const slugElements = slug ? slug.split("-") : []

  const [currentWish, setCurrentWish] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const getRandomWish = useCallback(() => {
    const wishes = post.frontmatter.wishes || []
    return wishes[Math.floor(Math.random() * wishes.length)] || "Best wishes!"
  }, [post.frontmatter.wishes])

  const typeText = useCallback((text, delay = 100) => {
    setIsTyping(true)
    setCurrentWish("")
    let i = 0
    const intervalId = setInterval(() => {
      console.log(i, text[i])
      setCurrentWish(prev => prev + text[i])
      i++
      if (i === text.length) {
        clearInterval(intervalId)
        setIsTyping(false)
      }
    }, delay)
  }, [])

  useEffect(() => {
    typeText(getRandomWish())
  }, [getRandomWish, typeText])

  const handleGenerateMore = () => {
    typeText(getRandomWish())
  }

  const recipientMapping = {
    devushku: "девушку",
    paren: "парня",
    "kollega-zhenshina": "коллегу (девушка)",
    "kollega-muzhchina": "коллегу (мужчина)",
    // Add other mappings
  }

  const holidayMapping = {
    denrozdenija: "День рождения",
    yubilei: "Юбилей",
    "1-aprelya": "1 апреля",
    // Add other mappings
  }

  const professionMapping = {
    administrator: "Администратор",
    akter: "Актер",
    aitishnik: "Айтишник",
    // Add other mappings
  }

  const styleMapping = {
    smeshnoe: "Смешное и остроумное",
    romantichnoe: "Романтичное",
    "v-stihah": "В стихах",
    // Add other mappings
  }

  const siteTitle = site.siteMetadata?.title || `Title`

  const [fetchedData, setFetchedData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const slugParts = slug.split("-")

    const setSelectedOption = (selectId, mapping) => {
      const select = document.getElementById(selectId)
      if (select) {
        const slugPart = slugParts.find(part =>
          Object.keys(mapping).includes(part)
        )
        if (slugPart) {
          select.value = mapping[slugPart]
        }
      }
    }

    setSelectedOption("recipients", recipientMapping)
    setSelectedOption("holidays", holidayMapping)
    setSelectedOption("professions", professionMapping)
    setSelectedOption("style", styleMapping)
  }, [slug])

  useEffect(() => {
    fetch("https://wisher-backend.smspm.workers.dev/api/beverages")
      .then(response => response.json())
      .then(data => {
        setFetchedData(data)
        setLoading(false)
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })
  }, [])

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        {loading && <p>Loading...</p>}
        {error && <p>Error fetching data: {error.message}</p>}
        {fetchedData && (
          <section>
            {/* Display the fetched data here */}
            <pre>{JSON.stringify(fetchedData, null, 2)}</pre>
          </section>
        )}

        {/* New UI section */}
        <section className="wisher-ui">
          <div className="row">
            <div className="col-md-2 col-xs-12 d-none d-sm-block subtitle">
              Кого
            </div>
            <div className="col-md-10 col-xs-12">
              <div className="row mb-0 mb-sm-2">
                <div className="col-md-auto mb-2 mb-sm-0 pe-0">
                  <label
                    htmlFor="recipients"
                    className="me-1 d-sm-none label_top"
                  >
                    Кого
                  </label>
                  <select
                    className="select_custom blue_arrow rounded-3"
                    id="recipients"
                    style={{ width: "fit-content" }}
                  >
                    <option value="парня">парня</option>
                    <option value="девушку">девушку</option>
                    <option value="коллегу (девушка)">коллегу (девушка)</option>
                    <option value="коллегу (мужчина)">коллегу (мужчина)</option>
                    <option value="маму">маму</option>
                    <option value="папу">папу</option>
                    <option value="брата">брата</option>
                    <option value="сестру">сестру</option>
                    <option value="друга">друга</option>
                    <option value="подругу">подругу</option>
                    <option value="пару (молодожены)">пару (молодожены)</option>
                    <option value="пару (супруги)">пару (супруги)</option>
                  </select>
                </div>
                <div className="col-md-auto mb-2 mb-sm-0 pe-0">
                  <label
                    htmlFor="holidays"
                    className="me-1 label_top d-none d-sm-inline-block"
                  >
                    с
                  </label>
                  <label
                    htmlFor="holidays"
                    className="me-1 label_top d-inline-block d-sm-none"
                  >
                    С чем
                  </label>
                  <select
                    className="select_custom red_arrow rounded-3"
                    id="holidays"
                    style={{ width: "fit-content" }}
                  >
                    <option value="День рождения">День рождения</option>
                    <option value="Юбилей">Юбилей</option>
                    <option value="1 апреля">1 апреля</option>
                    <option value="9 мая, день победы в ВОВ">
                      9 мая, день победы в ВОВ
                    </option>
                    <option value="Новый год">Новый год</option>
                    <option value="Рождество">Рождество</option>
                    <option value="8 марта">8 марта</option>
                    <option value="14 февраля">14 февраля</option>
                    <option value="23 февраля">23 февраля</option>
                    <option value="День защитника Отечества">
                      День защитника Отечества
                    </option>
                    <option value="День России">День России</option>
                    <option value="День влюбленных">День влюбленных</option>
                    <option value="День матери">День матери</option>
                    <option value="Профессиональный праздник">
                      Профессиональный праздник
                    </option>
                    <option value="Годовщина свадьбы">Годовщина свадьбы</option>
                    <option value="Свадьба">Свадьба</option>
                    <option value="Выпускной в школе">Выпускной в школе</option>
                    <option value="Выпускной в университете">
                      Выпускной в университете
                    </option>
                  </select>
                </div>
                <div className="col-md-auto mb-2 mb-sm-0">
                  <label
                    htmlFor="professions"
                    className="me-1 label_top d-none d-sm-inline-block"
                  >
                    профессия
                  </label>
                  <label
                    htmlFor="professions"
                    className="me-1 label_top d-inline-block d-sm-none"
                  >
                    Проф.
                  </label>
                  <select
                    className="selectpicker"
                    id="professions"
                    data-none-results-text="Не найдено"
                    style={{ width: "fit-content" }}
                  >
                    <option value="Не важно">Не важно</option>
                    <option value="Администратор">Администратор</option>
                    <option value="Актер">Актер</option>
                    <option value="Айтишник">Айтишник</option>
                    {/* Add more options here */}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-2 col-xs-12 d-none d-sm-block subtitle">
              Стиль
            </div>
            <div className="col-md-10 col-xs-12">
              <div className="row mb-2">
                <div className="col-md-auto mb-2 mb-sm-0 pe-0">
                  <label htmlFor="style" className="me-1 d-sm-none label_top">
                    Стиль
                  </label>
                  <select
                    className="select_custom_grn green_arrow rounded-3"
                    id="style"
                    style={{ width: "fit-content" }}
                  >
                    <option value="Смешное и остроумное">
                      Смешное и остроумное
                    </option>
                    <option value="Романтичное">Романтичное</option>
                    <option value="В стихах">В стихах</option>
                    <option value="Бизнес, деловой стиль">
                      Бизнес, деловой стиль
                    </option>
                    <option value="Длинное торжественное">
                      Длинное торжественное
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="generated-text">
            <p className="typing-animation">{currentWish}</p>
          </div>
          <div className="action-buttons">
            <button className="generate-btn">Сгенерировать еще</button>
            <button className="copy-btn">Скопировать</button>
          </div>
          <div className="slug-elements">
            {slugElements.map((element, index) => (
              <div key={index}>{element}</div>
            ))}
          </div>
        </section>

        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          {post.fields && post.fields.gitCommitTime ? (
            <p>
              Last updated:{" "}
              {new Date(post.fields.gitCommitTime).toLocaleString("en-US", {
                timeZone: "UTC",
              })}
            </p>
          ) : (
            <p>Last updated: Unknown</p>
          )}
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        {post.frontmatter.wishes && post.frontmatter.wishes.length > 0 && (
          <section>
            <h2>Wishes</h2>
            <ul>
              {post.frontmatter.wishes.map((wish, index) => (
                <li key={index}>{wish}</li>
              ))}
            </ul>
          </section>
        )}
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export const Head = ({ data: { markdownRemark: post } }) => {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      fields {
        slug
        gitCommitTime
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        wishes
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
        gitCommitTime
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
