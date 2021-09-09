/* @flow */

export type SetupCardOptions = {|
    cspNonce : string,
    facilitatorAccessToken : string
|};

export type Card = {|
    number : string,
    cvv : string,
    expiry : string
|};

export type FieldStyle = {|
    height? : number,
    color? : string,
    appearance? : string,
    boxShadow? : string,
    direction? : string,
    font? : string,
    fontFamily? : string,
    fontSizeAdjust? : string,
    fontSize? : string,
    fontStretch? : string,
    fontStyle? : string,
    fontVariantAlternates? : string,
    fontVariantCaps? : string,
    fontVariantEastAsian? : string,
    fontVariantLigatures? : string,
    fontVariantNumeric? : string,
    fontVariant? : string,
    fontWeight? : string,
    letterSpacing? : string,
    lineHeight? : string,
    opacity? : string,
    outline? : string,
    margin? : string,
    marginTop? : string,
    marginRight? : string,
    marginBottom? : string,
    marginLeft? : string,
    padding? : string,
    paddingTop? : string,
    paddingRight? : string,
    paddingBottom? : string,
    paddingLeft? : string,
    textAlign? : string,
    textShadow? : string,
    transition? : string,
    MozAppearance? : string,
    MozBoxShadow? : string,
    MozOsxFontSmoothing? : string,
    MozTapHighlightColor? : string,
    MozTransition? : string,
    WebkitAppearance? : string,
    WebkitBoxShadow? : string,
    WebkitFontSmoothing? : string,
    WebkitTapHighlightColor? : string,
    WebkitTransition? : string
|};

export type CardStyle = {| |};

export type CardPlaceholder = {|
    number? : string,
    expiry? : string,
    cvv? : string
|};
