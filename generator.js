const fs = require("fs")
const path = require("path")

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
  "s-dnem-rozhdeniya": "c Днем рождения",
  "s-yubileem": "с Юбилеем",
  "1-aprelya": "1 апреля",
  "9-maya-den-pobedy-v-vov": "9 мая, день победы в ВОВ",
  "s-novym-godom": "с Новым годом",
  "s-rozhdestvom": "с Рождеством",
  "s-8-marta": "с 8 марта",
}
const professionDisplayMapping = {
  "ne-vazhno": "Не важно",
  administrator: "администратора",
  akter: "актера",
  aitishnik: "айтишника",
}
const styleDisplayMapping = {
  smeshnoje: "Смешное",
  romantichnoe: "Романтичное",
  "v-stihah": "В стихах",
  formalnoje: "Формальное и красивое",
  torzhestvennoje: "Длинное торжественное",
}

// Helper function to create folders and files
const createFolderAndFile = (slug, title, selectedValues) => {
  const folderPath = path.join("content", "blog", "ru", slug)
  const fileContent = `---
title: ${title}
date: "${new Date().toISOString()}"
wishes:
  - "I wish you all the best"
  - "Happy birthday, I wish you a fantastic year ahead!"
  - "May all your dreams come true"
  - "Wishing you happiness and success in all your endeavors"
selectedValues:
  recipients: "${selectedValues.recipients}"
  holidays: "${selectedValues.holidays}"
  professions: "${selectedValues.professions}"
  style: "${selectedValues.style}"
---

Wow! I love blogging so much already.

Did you know that "despite its name, salted duck eggs can also be made from
chicken eggs, though the taste and texture will be somewhat different, and the
egg yolk will be less rich."?
([Wikipedia Link](https://en.wikipedia.org/wiki/Salted_duck_egg))

Yeah, I didn't either.
`

  fs.mkdir(folderPath, { recursive: true }, err => {
    if (err) {
      return console.error(`Error creating folder: ${err.message}`)
    }
    console.log(`Folder created: ${folderPath}`)

    const filePath = path.join(folderPath, "index.md")
    fs.writeFile(filePath, fileContent, err => {
      if (err) {
        return console.error(`Error writing file: ${err.message}`)
      }
      console.log(`File created: ${filePath}`)
    })
  })
}

// Generate all possible slugs and titles
for (const recipientKey in recipientDisplayMapping) {
  for (const holidayKey in holidayDisplayMapping) {
    for (const professionKey in professionDisplayMapping) {
      for (const styleKey in styleDisplayMapping) {
        const slugParts = ["pozdravit", recipientKey]
        const selectedValues = {
          recipients: recipientKey,
          holidays: holidayKey,
          professions: professionKey,
          style: styleKey,
        }

        if (professionKey !== "ne-vazhno") {
          slugParts.push(professionKey)
        }

        slugParts.push(holidayKey, styleKey)
        const slug = slugParts.join("-")

        const title = `Поздравить ${recipientDisplayMapping[recipientKey]}${
          professionKey !== "ne-vazhno"
            ? " " + professionDisplayMapping[professionKey]
            : ""
        } ${holidayDisplayMapping[holidayKey]}. ${
          styleDisplayMapping[styleKey]
        }`

        createFolderAndFile(slug, title, selectedValues)
      }
    }
  }
}
