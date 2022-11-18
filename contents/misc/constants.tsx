// Deprecated, and should only be used for development testing
// Production code should request tags from the server
export const all_tags = {
  plasmo: {
    header_bar_actions: ".css-sk2d8b",
    feature_title: ".css-1ued4kf",
    card_name: ".css-1x58i3f"
  },
  fb: {
    newsfeed_name_strong:
      "span.rse6dlih:not(.rrjlc0n4):not(.jwegzro5) > span:not([cedula_marked]),a:not([cedula_marked]) > strong:not([cedula_marked])",
    newsfeed_name:
      "span.rse6dlih:not(.rrjlc0n4):not(.jwegzro5) > span:not([cedula_marked]) > span:not([cedula_marked])",
    comment_name:
      "span.fxk3tzhb:not(.p8bhzyuu):not(.ewjwymqb ):not(.b2rh1bv3):not(.c7y9u1f0) > span:not([cedula_marked])",
    is_with_post:
      "span.x193iq5w > strong > span > a.x1i10hfl > span.xt0psk2:not([cedula_marked]) > span:not([cedula_marked])",
    comment_name_bold:
      "span.xt0psk2 > a.x1i10hfl > span.x3nfvp2 > span.x193iq5w:not([cedula_marked])"
    // profile_name: {
    //   path: ["h1.jxuftiz4.jwegzro5.hl4rid49.icdlwmnq"],
    //   query: [1]
    // }
  },
  twitter: {
    tweet:
      "div.css-1dbjc4n > a.css-4rbku5 > div.css-1dbjc4n > div.r-1awozwy > span.css-16my406:not([cedula_marked]) > span.css-16my406:not([cedula_marked])"
  },
  reddit: {
    comment:
      "span._1a_HxF03jCyxnx706hQmJR > div._3QEK34iVL1BjyHAVleVVNQ > div._2mHuuvyV9doV3zwbZPtIPG > div > a.wM6scouPXXsFDSZmZPHRo:not([cedula_marked])",
    op: "div._2mHuuvyV9doV3zwbZPtIPG > div > a._2tbHP6ZydRpjI44J3syuqC:not([cedula_marked])"
  }
}

export const ph_badge_link =
  "https://res.cloudinary.com/dml9ugyzo/image/upload/v1665682106/Philippines/ph_baqkcu.png"
