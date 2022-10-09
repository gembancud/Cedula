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
  }
}
