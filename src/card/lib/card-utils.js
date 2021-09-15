/* @flow */

import { camelToDasherize, noop } from 'belter';
import creditCardType, { types } from 'credit-card-type';
import luhn10 from 'card-validator/src/luhn-10';

import type { CardType, CardNavigation } from '../types';

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

const VALIDATOR_TO_TYPE_MAP = {
    [types.AMERICAN_EXPRESS]: 'AMEX',
    [types.DINERS_CLUB]:      'DINERS',
    [types.DISCOVER]:         'DISCOVER',
    [types.ELO]:              'ELO',
    [types.HIPER]:            'HIPER',
    [types.HIPERCARD]:        'HIPERCARD',
    [types.JCB]:              'JCB',
    [types.MASTERCARD]:       'MASTER_CARD',
    [types.MAESTRO]:          'MAESTRO',
    [types.UNIONPAY]:         'CHINA_UNION_PAY',
    [types.VISA]:             'VISA',
    'cb-nationale':           'CB_NATIONALE',
    'cetelem':                'CETELEM',
    'cofidis':                'COFIDIS',
    'cofinoga':               'COFINOGA'
};

export const defaultCardType : CardType = {
    gaps:     [ 4, 8, 12 ],
    lengths:  [ 16 ],
    patterns: [],
    type:     'Unknow',
    niceType: 'Unknow',
    code:     {
        name: 'CVV',
        size: 3
    }
};

export const defaultInputStyle = {
    border:     'none',
    background: 'transparent',
    height:     '100%',
    fontFamily: 'monospace',
    fontSize:   '50vh',
    display:    'inline-block'
};

export const defaultStyles = {
    'input':        defaultInputStyle,
    'input.number': {
        width:       '60vw',
        marginRight: '2vw'
    },
    'input.cvv': {
        width:       '16vw',
        marginRight: '2vw'
    },
    'input.expiry': {
        width: '20vw'
    }
};
export const defaultPlaceholders = {
    number: 'Card number',
    expiry: 'MM/YY',
    cvv:    'CVV'
};

export const defaultNavigation : CardNavigation = {
    next:     () => noop,
    previous: () => noop
};

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

    return defaultCardType;
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


// eslint-disable-next-line flowtype/require-exact-type
export function styleToString(style : {  }) : string {
    return Object.keys(style).reduce((acc : string, key : string) => (
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

export function checkCVV(value : string, cardType : CardType) : boolean {

    if (value.length === getCvvLength(cardType)) {
        return true;
    }
    return false;
}

export function checkExpiry(value : string) : boolean {
    if (value.replace(/\s|\//g, '').length === 4) {
        return true;
    }
    return false;
}

export function setErrors({ isNumberValid, isCvvValid, isExpiryValid } : {| isNumberValid : boolean, isCvvValid : boolean, isExpiryValid : boolean |}) : $ReadOnlyArray<string> {
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

export function checkRef(nextRef : mixed) : boolean {
    // $FlowFixMe
    return nextRef && nextRef.current && nextRef.current.base && typeof nextRef.current.base.focus === 'function';
}

export function moveCursor(event : Event, start : number, end : number) : mixed {
    const element = event.target;
    window.requestAnimationFrame(() => {
        // $FlowFixMe
        element.selectionStart = start;
        // $FlowFixMe
        element.selectionEnd = end;
    });
}
