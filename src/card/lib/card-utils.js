/* @flow */

import { camelToDasherize } from 'belter/src';
import creditCardType, { types } from 'credit-card-type';

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
    'cetelem':                  'CETELEM',
    'cofidis':                  'COFIDIS',
    'cofinoga':                 'COFINOGA'
};


const splice = (str : string, idx : number, insert : string) : string => str.slice(0, idx) + insert + str.slice(idx);


const assertType = (assertion, errorMsg) => {
    if (!assertion) {
        throw new TypeError(errorMsg);
    }
};

const assertString = (...args) => {
    assertType(args.every((s) => typeof s === 'string'), 'Expected a string');
};

/**
 * Detect the card type metadata for a card number
 * @param {string} number Card number
 * @returns {object} Card type metadata object
 */
const detectCardType = (number) => {
    const cardType = creditCardType(number)?.[0];

    if (cardType) {
        return {
            ...cardType,
            type: VALIDATOR_TO_TYPE_MAP[cardType.type]
        };
    }

    return { gaps: [ 4, 8, 12 ] };
};

/**
 * Mask a card number for display given a card type. If a card type is
 * not provided, attempt to detect it and mask based on that type.
 * @param {string} cardNumber Card number
 * @returns {string} Masked card number
 */
export function maskCard(number : string, cardType? : {| |}) : string {
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

export const maskExpiry = (date : string) : string => {
    assertString(date);
    date = date.trim().replace(/\s/g, '').replace(/\//g, '');
    const gaps = [ 2 ];

    if (gaps) {
        for (let idx = 0; idx < gaps.length; idx++) {
            const splicePoint = gaps[idx] + idx;
            if (splicePoint > date.length - 1) {
                // We're beyond the end of the date
                break;
            }

            date = splice(date, splicePoint, '/');
        }
    }
    return date;
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

export function checkCardNumber(value : string) : boolean {
    const trimmedValue = value.replace(/\s/g, '');
    if (trimmedValue.length <= 16) {
        return true;
    }
    return false;
}

export function checkCVV(value : string) : boolean {
    if (value.length === 3) {
        return true;
    }
    return false;
}

export function checkExpiry(value : string) : boolean {
    if (value.replace(/\//g, '').length === 4) {
        return true;
    }
    return false;
}

export const isNumberKey = (event : Event) => {
    const allowedKeys = [ 'Tab', 'Backspace', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
    const digitRegex = /[^0-9]/;
    // $FlowFixMe
    if (digitRegex.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault();
    }
};
