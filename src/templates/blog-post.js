import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { Link, graphql, navigate } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPostTemplate = ({
  data: { previous, next, site, markdownRemark: post },
  location,
}) => {
  const slug = location.pathname.split("/").filter(Boolean).pop()

  const [currentWish, setCurrentWish] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const [selectedValues, setSelectedValues] = useState({
    recipients: post.frontmatter.selectedValues?.recipients || "",
    holidays: post.frontmatter.selectedValues?.holidays || "",
    professions: post.frontmatter.selectedValues?.professions || "",
    style: post.frontmatter.selectedValues?.style || "",
  })

  const [wishes, setWishes] = useState([])

  useEffect(() => {
    if (post.frontmatter.wishes) {
      const sortedWishes = [...post.frontmatter.wishes].sort(
        (a, b) => b.rating - a.rating
      )
      setWishes(sortedWishes)
    }
  }, [post.frontmatter.wishes])

  const handleVote = async (id, voteType) => {
    try {
      const response = await fetch(
        "https://sonicjs.smspm.workers.dev/o/sendinwisher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            voteType,
            IP: "user_ip_here", // You'll need to implement a way to get the user's IP
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state to disable buttons
      setWishes(prevWishes =>
        prevWishes.map(wish =>
          wish.id === id ? { ...wish, voted: true } : wish
        )
      )
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
  }

  const handleDropdownChange = event => {
    const { id, value } = event.target
    setSelectedValues(prev => ({ ...prev, [id]: value }))
    buildSlugAndRedirect()
  }

  const getRandomWish = useCallback(() => {
    const wishes = post.frontmatter.wishes || []
    if (wishes.length === 0) {
      return "This page doesn't have wishes yet. Click Generate button to generate one"
    }
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)]
    return randomWish.text || "Best wishes!"
  }, [post.frontmatter.wishes])

  const typeText = useCallback((text, delay = 100) => {
    setIsTyping(true)
    setCurrentWish("")
    const characters = text.split("")

    characters.forEach((char, index) => {
      setTimeout(() => {
        setCurrentWish(prev => prev + char)
        if (index === characters.length - 1) {
          setIsTyping(false)
        }
      }, delay * index)
    })
  }, [])

  const buildSlugAndRedirect = () => {
    const recipients = document.getElementById("recipients").value
    const holidays = document.getElementById("holidays").value
    const professions = document.getElementById("professions").value
    const style = document.getElementById("style").value

    let slugParts = ["pozdravit", recipients]

    if (professions !== "ne-vazhno") {
      slugParts.push(professions)
    }

    slugParts = slugParts.concat([holidays, style])

    const newSlug = "/" + slugParts.join("-")

    // Use Gatsby's navigate function for client-side routing
    navigate("/ru" + newSlug)
  }

  useEffect(() => {
    typeText(getRandomWish())
  }, [getRandomWish, typeText])

  const generateCurrentSlug = () => {
    let slugParts = ["pozdravit", selectedValues.recipients]

    if (selectedValues.professions !== "ne-vazhno") {
      slugParts.push(selectedValues.professions)
    }

    slugParts = slugParts.concat([
      selectedValues.holidays,
      selectedValues.style,
    ])

    return slugParts.join("-")
  }

  const handleGenerateMore = async () => {
    const currentSlug = generateCurrentSlug()

    const recipientDisplayMapping = {
      parnja: "парня",
      devushku: "девушку",
      mamu: "маму",
      papu: "папу",
      brata: "брата",
      sestru: "сестру",
      druga: "друга",
      podrugu: "подругу",
      babushku: "бабушку",
      dedushku: "дедушку",
      kollegu: "коллегу",
      paru: "пару",
    }

    const holidayDisplayMapping = {
      "s-dnem-rozhdeniya": "c Денем рождения",
      "s-yubileem": "с Юбилеем",
      "1-aprelya": "1 апреля",
      "9-maya-den-pobedy-v-vov": "9 мая, день победы в ВОВ",
      "s-novym-godom": "Новый год",
      "s-rozhdestvom": "Рождество",
      "s-8-marta": "8 марта",
      // Add other mappings as needed
    }

    const professionDisplayMapping = {
      "ne-vazhno": "Не важно",
      Administrator: "Администратор",
      Akter: "Актер",
      Aitishnik: "Айтишник",
      // Add other mappings as needed
    }

    const styleDisplayMapping = {
      smeshnoje: "Смешное и остроумное",
      romantichnoe: "Романтичное",
      "v-stihah": "В стихах",
      formalnoje: "Формальное и красивое",
      torzhestvennoje: "Длинное торжественное",
    }
    const requestBody = {
      who: recipientDisplayMapping[selectedValues.recipients],
      celebration: holidayDisplayMapping[selectedValues.holidays],
      occupation: professionDisplayMapping[selectedValues.professions],
      style: styleDisplayMapping[selectedValues.style],
      language: "ru",
      slug: currentSlug,
    }

    setIsTyping(true)
    setCurrentWish("")
    typeText("Искусственный интеллект думает...")

    try {
      const response = await fetch(
        "https://sonicjs.smspm.workers.dev/o/sendinwisher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Assuming the response contains a 'wish' field. Adjust if the response structure is different.
      if (data && data.result) {
        setCurrentWish("")
        typeText(data.result)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      console.error("Error fetching new wish:", error)
      setCurrentWish("Извините, произошла ошибка при генерации пожелания.")
      setIsTyping(false)
    }
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

  useEffect(() => {
    const slugParts = slug.split("-")

    const setSelectedOption = (selectId, mapping) => {
      const select = document.getElementById(selectId)
      if (select) {
        const slugPart = slugParts.find(part =>
          Object.keys(mapping).includes(part)
        )
        if (slugPart) {
          select.value = slugPart
        }
        // Add change event listener
        select.addEventListener("change", buildSlugAndRedirect)
      }
    }

    setSelectedOption("recipients", recipientMapping)
    setSelectedOption("holidays", holidayMapping)
    setSelectedOption("professions", professionMapping)
    setSelectedOption("style", styleMapping)

    // Cleanup function to remove event listeners
    return () => {
      ;["recipients", "holidays", "professions", "style"].forEach(id => {
        const select = document.getElementById(id)
        if (select) {
          select.removeEventListener("change", buildSlugAndRedirect)
        }
      })
    }
  }, [slug])

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
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
                    value={selectedValues.recipients}
                    onChange={handleDropdownChange}
                  >
                    <option value="parnja">парня</option>
                    <option value="devushku">девушку</option>
                    <option value="mamu">маму</option>
                    <option value="papu">папу</option>
                    <option value="brata">брата</option>
                    <option value="sestru">сестру</option>
                    <option value="druga">друга</option>
                    <option value="podrugu">подругу</option>
                    <option value="babushku">бабушку</option>
                    <option value="dedushku">дедушку</option>
                    <option value="kollegu">коллегу</option>
                    <option value="paru">пару</option>
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
                    value={selectedValues.holidays}
                    onChange={handleDropdownChange}
                  >
                    <option value="s-dnem-rozhdeniya"> c Денем рождения</option>
                    <option value="s-yubileem">с Юбилеем</option>
                    <option value="1-aprelya">1 апреля</option>
                    <option value="9-maya-den-pobedy-v-vov">
                      9 мая, день победы в ВОВ
                    </option>
                    <option value="s-novym-godom">Новый год</option>
                    <option value="s-rozhdestvom">Рождество</option>
                    <option value="s-8-marta">8 марта</option>
                    <option value="s-dnem-zashitnika-otechestva">
                      День защитника Отечества
                    </option>
                    <option value="s-dnem-rossii">День России</option>
                    <option value="s-dnem-vlyublennih">День влюбленных</option>
                    <option value="s-dnem-materi">День матери</option>
                    <option value="s-godovshinoj-svavadby">
                      Годовщина свадьбы
                    </option>
                    <option value="so-svadboj">Свадьба</option>
                    <option value="s-vypusknym-v-shkole">
                      Выпускной в школе
                    </option>
                    <option value="s-vypussknym-v-universitete">
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
                    value={selectedValues.professions}
                    onChange={handleDropdownChange}
                  >
                    <option value="ne-vazhno">Не важно</option>
                    <option value="administrator">Администратор</option>
                    <option value="akter">Актер</option>
                    <option value="aitishnik">Айтишник</option>
                    <option value="barmen">Бармен</option>
                    <option value="biznesmen">Бизнесмен</option>
                    <option value="bloger">Блогер</option>
                    <option value="buhgalter">Бухгалтер</option>
                    <option value="voditel">Водитель</option>
                    <option value="voennyy">Военный</option>
                    <option value="vrach">Врач</option>
                    <option value="direktor">Директор</option>
                    <option value="dizayner">Дизайнер</option>
                    <option value="zhurnalist">Журналист</option>
                    <option value="inzhener">Инженер</option>
                    <option value="kriptan">Криптан</option>
                    <option value="menedzher">Менеджер</option>
                    <option value="ohrannik">Охранник</option>
                    <option value="perevodchik">Переводчик</option>
                    <option value="predprinimatel">Предприниматель</option>
                    <option value="prodavets">Продавец</option>
                    <option value="programmist">Программист</option>
                    <option value="razrabotchik">Разработчик</option>
                    <option value="sekretar">Секретарь</option>
                    <option value="taksist">Таксист</option>
                    <option value="uchitel">Учитель</option>
                    <option value="fotograf">Фотограф</option>
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
                    value={selectedValues.style}
                    onChange={handleDropdownChange}
                  >
                    <option value="smeshnoje">Смешное и остроумное</option>
                    <option value="romantichnoe">Романтичное</option>
                    <option value="v-stihah">В стихах</option>
                    <option value="formalnoje">Формальное и красивое</option>
                    <option value="torzhestvennoje">
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
            <button
              className="generate-btn"
              onClick={handleGenerateMore}
              disabled={isTyping}
            >
              Сгенерировать еще
            </button>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(currentWish)}
            >
              Скопировать
            </button>
          </div>
        </section>

        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          {post.fields && post.fields.gitCommitTime ? (
            <p>
              Последнее обновление:{" "}
              {new Date(post.fields.gitCommitTime).toLocaleString("en-US", {
                timeZone: "UTC",
              })}
            </p>
          ) : (
            <p>Последнее обновление: неизвестно</p>
          )}
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        {post.frontmatter.wishes && post.frontmatter.wishes.length > 0 && (
          <section className="wishes-section">
            <h2>Поздравления</h2>
            <div className="wishes-container">
              {wishes.map(wish => (
                <div key={wish.id} className="wish-card">
                  <p>{wish.text}</p>
                  <div className="wish-footer">
                    <div className="rating">
                      Рейтинг: {wish.rating}
                      <button
                        onClick={() => handleVote(wish.id, "upvote")}
                        disabled={wish.voted}
                      >
                        Нравится
                      </button>
                      <button
                        onClick={() => handleVote(wish.id, "downvote")}
                        disabled={wish.voted}
                      >
                        Не нравится
                      </button>
                    </div>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(wish.text)}
                    >
                      Скопировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
        wishes {
          id
          text
          rating
        }
        selectedValues {
          recipients
          holidays
          professions
          style
        }
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
