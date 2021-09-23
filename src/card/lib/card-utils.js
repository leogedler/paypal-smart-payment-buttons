/* @flow */

import { camelToDasherize, noop } from 'belter';
import creditCardType from 'credit-card-type';
import luhn10 from 'card-validator/src/luhn-10';

import type { CardType, CardNavigation, InputState, FieldValidity, FieldStyle, InputEvent } from '../types';
import { CARD_ERRORS, FIELD_STYLES, VALIDATOR_TO_TYPE_MAP, DEFAULT_CARD_TYPE } from '../constants';

// Add additional supported card types
creditCardType.addCard({
    code: {
        name: 'CVV',
        size: 3
    },
    gaps:     [ 4, 8, 12 ],
    lengths:  [ 16, 18, 19 ],
    niceType: 'Carte Bancaire',
    patterns: [],
    type:     'cb-nationale'
});

creditCardType.addCard({
    code: {
        name: 'CVV',
        size: 3
    },
    gaps:     [ 4, 8, 12, 16 ],
    lengths:  [ 19 ],
    niceType: 'Carte Aurore',
    patterns: [],
    type:     'cetelem'
});

creditCardType.addCard({
    code: {
        name: '',
        size: 0
    },
    gaps:     [ 4, 8, 12, 16 ],
    lengths:  [ 17 ],
    niceType: 'Cofinoga ou Privilège',
    patterns: [],
    type:     'cofinoga'
});

creditCardType.addCard({
    code: {
        name: '',
        size: 0
    },
    gaps:     [ 4, 8 ],
    lengths:  [ 8, 9 ],
    niceType: '4 étoiles',
    patterns: [],
    type:     'cofidis'
});

export const defaultNavigation : CardNavigation = {
    next:     () => noop,
    previous: () => noop
};

export const initInputState : InputState = {
    inputValue:       '',
    maskedInputValue: '',
    cursorStart:      0,
    cursorEnd:        0,
    keyStrokeCount:   0,
    isPossibleValid:  true,
    isValid:          false
};

export const initFieldValidity : FieldValidity = { isValid: false, isPossibleValid: true };

export function splice(str : string, idx : number, insert : string) : string {
    return str.slice(0, idx) + insert + str.slice(idx);
}


export function assertType(assertion : () => void, errorMsg : string) : mixed {
    if (!assertion) {
        throw new TypeError(errorMsg);
    }
}

export function assertString<T>(...args : T) : mixed {
    // $FlowFixMe
    assertType(args.every((s) => typeof s === 'string'), 'Expected a string');
}

// Detect the card type metadata for a card number
export function detectCardType(number : string) : CardType {
    const cardType = creditCardType(number)?.[0];

    if (cardType) {
        return {
            ...cardType,
            type: VALIDATOR_TO_TYPE_MAP[cardType.type]
        };
    }

    return DEFAULT_CARD_TYPE;
}

// Mask a card number for display given a card type. If a card type is
// not provided, attempt to detect it and mask based on that type.
export function maskCard(number : string, cardType? : CardType) : string {
    assertString(number);
    number = number.trim().replace(/[^0-9]/g, '').replace(/\s/g, '');
    // $FlowFixMe
    const gaps = cardType?.gaps || detectCardType(number)?.gaps;

    if (gaps) {
        for (let idx = 0; idx < gaps.length; idx++) {
            const splicePoint = gaps[idx] + idx;
            if (splicePoint > number.length - 1) {
                // We're beyond the end of the number
                break;
            }

            number = splice(number, splicePoint, ' ');
        }
    }
    return number;
}

export function removeDateMask(date : string) : string {
    return date.trim().replace(/\s|\//g, '');
}


// Mask date
export function maskDate(date : string) : string {
    assertString(date);

    if (date.trim().slice(-1) === '/') {
        // eslint-disable-next-line unicorn/prefer-string-slice
        return date.substring(0, 2);
    }

    date = removeDateMask(date);
    
    if (date.length < 2) {
        const first = date[0];
        if (parseInt(first, 10) > 1) {
            return `0${ first } / `;
        }
        return date;
    }

    // eslint-disable-next-line unicorn/prefer-string-slice
    const month = date.substring(0, 2);
    if (parseInt(month, 10) > 12) {
        const first = month[0];
        const second = month[1];
        return `0${ first } / ${ second }`;
    }

    // eslint-disable-next-line unicorn/prefer-string-slice
    const year = date.substring(2, 4);
    return `${ month } / ${ year }`;

}


// $FlowFixMe
export function filterStyles(rawStyles : {| |} = {}) : FieldStyle {
    const camelKey = Object.keys(FIELD_STYLES);
    const dashKey = Object.values(FIELD_STYLES);

    // $FlowFixMe
    return Object.keys(rawStyles).reduce((acc : {|  |}, key : string) => {
        if (typeof rawStyles[key] === 'object') {
            acc[key] = rawStyles[key];
        } else if (camelKey.includes(key) || dashKey.includes(key)) {
            acc[key] = rawStyles[key];
        }
        return acc;
    }, { });

}

// eslint-disable-next-line flowtype/require-exact-type
export function styleToString(style : {  } = { }) : string {
    // $FlowFixMe
    const filteredStyles = filterStyles(style);
    return Object.keys(filteredStyles).reduce((acc : string, key : string) => (
        `${ acc }  ${ camelToDasherize(key) } ${ typeof style[key] === 'object' ? `{ ${ styleToString(style[key]) } }` : `: ${ style[key] } ;` }`
    ), '');
}

export function getStyles(style : {| |}) : [mixed, mixed] {
    // $FlowFixMe
    return Object.keys(style).reduce((acc : [{| |}, {| |}], key : string) => {
        if (typeof style[key] === 'object') {
            acc[0][key] = style[key];
        } else {
            acc[1][key] = style[key];
        }
        return acc;
    }, [ {}, {} ]);
}

export function removeSpaces(value : string) : string {
    return value.replace(/\s/g, '');
}

export function removeNonDigits(value : string) : string {
    const trimmedValue = removeSpaces(value);
    return trimmedValue.replace(/\D/g, '');
}

export function checkForNonDigits(value : string) : boolean {
    return (/\D/g).test(removeSpaces(value));
}

export function getCvvLength(cardType : CardType) : number {
    const { code } = cardType;

    if (typeof code === 'object') {
        const { size } = code;

        if (typeof size === 'number') {
            return size;
        }
    }

    return 3;
}

export function checkCardNumber(value : string, cardType : CardType) : {| isValid : boolean, isPossibleValid : boolean |} {
    const trimmedValue = removeSpaces(value);
    const { lengths } = cardType;

    const validLength = lengths.some((length) => length === trimmedValue.length);
    const validLuhn = luhn10(trimmedValue);

    const maxLength = Math.max.apply(null, lengths);

    return {
        isValid:         validLength && validLuhn,
        isPossibleValid: validLength || trimmedValue.length < maxLength
    };
}

export function checkCVV(value : string, cardType : CardType) : {| isValid : boolean, isPossibleValid : boolean |} {
    let isValid = false;
    if (value.length === getCvvLength(cardType)) {
        isValid = true;
    }
    return {
        isValid,
        isPossibleValid: true
    };
}

export function checkExpiry(value : string) : {| isValid : boolean, isPossibleValid : boolean |} {
    let isValid = false;
    if (value.replace(/\s|\//g, '').length === 4) {
        isValid = true;
    }
    return {
        isValid,
        isPossibleValid: true
    };
}

export function setErrors({ isNumberValid, isCvvValid, isExpiryValid } : {| isNumberValid : boolean, isCvvValid : boolean, isExpiryValid : boolean |}) : [$Values<typeof CARD_ERRORS>] | [] {
    const errors = [];

    if (!isNumberValid) {
        errors.push('Invalid card number');
    }

    if (!isCvvValid) {
        errors.push('Invalid CVV');
    }

    if (!isExpiryValid) {
        errors.push('Invalid expiration date');
    }
    
    return errors;
}

export function moveCursor(event : InputEvent, start : number, end : number) : mixed {
    const element = event.target;
    window.requestAnimationFrame(() => {
        element.selectionStart = start;
        element.selectionEnd = end;
    });
}


export function goToNextField(ref : {| current : {| base : HTMLInputElement |} |}) : () => void {
    return () => {
        ref.current.base.selectionStart = 0;
        ref.current.base.selectionEnd = 0;
        ref.current.base.focus();
    };
}

export function goToPreviousField(ref : {| current : {| base : HTMLInputElement |} |}) : () => void {
    return () => {
        const { value } = ref.current.base;

        if (value) {
            ref.current.base.selectionStart = value.length;
            ref.current.base.selectionEnd = value.length;
        }
        ref.current.base.focus();
    };
}
