/* @flow */

import { camelToDasherize, noop, values } from 'belter';
import creditCardType from 'credit-card-type';
import luhn10 from 'card-validator/src/luhn-10';
import cardValidator from 'card-validator';

import type { CardType, CardNavigation, InputState, FieldValidity, FieldStyle, InputEvent, Card } from '../types';
import { CARD_ERRORS, FIELD_STYLE, VALIDATOR_TO_TYPE_MAP, DEFAULT_CARD_TYPE, GQL_ERRORS } from '../constants';
import { getActiveElement } from '../../lib/dom';

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

export const defaultInputState : InputState = {
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


export function assertType(assertion : () => void, errorMsg : string) : void | TypeError {
    if (!assertion) {
        throw new TypeError(errorMsg);
    }
}

export function assertString<T>(...args : T) : void | TypeError {
    // $FlowFixMe
    assertType(args.every((s) => typeof s === 'string'), 'Expected a string');
}

export function removeSpaces(value : string) : string {
    return value.replace(/\s/g, '');
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

// Return the last 4 digits of a valid card number
export function maskValidCard(number : string) : string {
    const trimmedValue = removeSpaces(number);
    const lastFour = trimmedValue.slice(-4);
    const maskedNumber = number.replace(/\d/g, '•').slice(0, -4);

    return maskedNumber + lastFour;
}

export function removeDateMask(date : string) : string {
    return date.trim().replace(/\s|\//g, '');
}


// Format expiry date
export function formatDate(date : string, prevFormat? : string = '') : string {
    assertString(date);

    if (prevFormat && prevFormat.indexOf('/') > -1) {
        const [ month ] = removeSpaces(prevFormat).split('/');
        if (month.length < 2) {
            return prevFormat;
        }
    }

    if (date.trim().slice(-1) === '/') {
        return date.slice(0, 2);
    }

    date = removeDateMask(date);

    if (date.length < 2) {
        const first = date[0];
        if (parseInt(first, 10) > 1) {
            return `0${ first } / `;
        }
        return date;
    }

    const month = date.slice(0, 2);
    if (parseInt(month, 10) > 12) {
        const first = month[0];
        const second = month[1];
        return `0${ first } / ${ second }`;
    }

    const year = date.slice(2, 4);
    return `${ month } / ${ year }`;

}

// Removed invalid and/or unsupported style props
export function filterStyles(rawStyles : Object = {}) : FieldStyle {
    const camelKey = Object.keys(FIELD_STYLE);
    const dashKey = values(FIELD_STYLE);

    // $FlowFixMe
    return Object.keys(rawStyles).reduce((acc : Object, key : string) => {
        if (typeof rawStyles[key] === 'object') {
            acc[key] = rawStyles[key];
        } else if (camelKey.indexOf(key) > -1 || dashKey.indexOf(key) > -1) {
            acc[key] = rawStyles[key];
        }
        return acc;
    }, { });

}

// Converts style object to valid style string
export function styleToString(style : Object = { }) : string {
    const filteredStyles = filterStyles(style);
    return Object.keys(filteredStyles).reduce((acc : string, key : string) => (
        `${ acc }  ${ camelToDasherize(key) } ${ typeof style[key] === 'object' ? `{ ${ styleToString(style[key]) } }` : `: ${ style[key] } ;` }`
    ), '');
}

// Destructures nested style objects
export function getStyles(style : Object) : [Object, Object] {
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

export function removeNonDigits(value : string) : string {
    const trimmedValue = removeSpaces(value);
    return trimmedValue.replace(/\D/g, '');
}

export function checkForNonDigits(value : string) : boolean {
    return (/\D/g).test(removeSpaces(value));
}

export function getCvvLength(cardType? : CardType) : number {
    if (cardType && typeof cardType === 'object') {
        const { code } = cardType;

        if (typeof code === 'object') {
            const { size } = code;

            if (typeof size === 'number') {
                return size;
            }
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
    const { expirationDate } = cardValidator;
    const { isValid } = expirationDate(value);

    return {
        isValid,
        isPossibleValid: true
    };
}

export function setErrors({ isNumberValid, isCvvValid, isExpiryValid } : {| isNumberValid? : boolean, isCvvValid? : boolean, isExpiryValid? : boolean |}) : [$Values<typeof CARD_ERRORS>] | [] {
    const errors = [];

    if (typeof isNumberValid === 'boolean' && !isNumberValid) {
        errors.push(CARD_ERRORS.INVALID_NUMBER);
    }

    if (typeof isExpiryValid === 'boolean' && !isExpiryValid) {
        errors.push(CARD_ERRORS.INVALID_EXPIRY);
    }

    if (typeof isCvvValid === 'boolean' &&  !isCvvValid) {
        errors.push(CARD_ERRORS.INVALID_CVV);
    }

    return errors;
}

// Move cursor within a field
export function moveCursor(element : HTMLInputElement, start : number, end? : number) : void {
    window.requestAnimationFrame(() => {
        element.selectionStart = start;
        element.selectionEnd = end ?? start;
    });
}

// Navigation helper to go to the next field putting the cursor at the start
export function goToNextField(ref : {| current : {| base : HTMLInputElement |} |}) : () => void {
    return () => {
        moveCursor(ref.current.base, 0);
        setTimeout(() => ref.current.base.focus());
    };
}

// Navigation helper to go to the previous field putting the curser at the end
export function goToPreviousField(ref : {| current : {| base : HTMLInputElement |} |}) : () => void {
    return () => {
        const { value } = ref.current.base;

        if (value) {
            const valueLength = value.length;
            moveCursor(ref.current.base, valueLength);
        }
        setTimeout(() => ref.current.base.focus());
    };
}

// Navigate between fields using the arrow keys and/or the backspace
export function navigateOnKeyDown(event : InputEvent, navigation : CardNavigation) : void {
    const { target: { value, selectionStart, selectionEnd }, key } = event;

    if (selectionStart === 0 && (value.length === 0 || value.length !== selectionEnd)  && [ 'Backspace', 'ArrowLeft' ].indexOf(key) > -1) {
        navigation.previous();
    }

    if (selectionStart === value.length && [ 'ArrowRight' ].indexOf(key) > -1) {
        navigation.next();
    }
}

// Format expity date to MM/YYYY
export function convertDateFormat(date : string) : string {
    const trimmedDate = removeSpaces(date);
    const splittedDate = trimmedDate.split('/');
    let formattedDate = trimmedDate;

    if (splittedDate[1] && splittedDate[1].length === 2) {
        splittedDate[1] = `20${ splittedDate[1] }`;
        formattedDate = splittedDate.join('/');
    }

    return formattedDate;
}


// Safari (both iOS and Desktop) has an unconvential behavior,
// where it won't let an iframe that includes an input get
// focus programatically from outisde of the input.
// Big props to the devs at Stripe that figured out
// you run this selection range hack to force the focus back
// onto the input.
function applyFocusWorkaroundForSafari (input : HTMLInputElement) {
    const inputIsEmptyInitially = input.value === '';

    // Safari can't set selection if the input is empty
    if (inputIsEmptyInitially) {
        input.value = ' ';
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.setSelectionRange(0, 0);
    input.setSelectionRange(start, end);

    if (inputIsEmptyInitially) {
        input.value = '';
    }
}

export function autoFocusOnFirstInput(input? : HTMLInputElement) {
    if (!input) {
        return;
    }

    window.addEventListener('focus', () => {
        // the set timeout is required here, because in some browsers (Firefox, for instance)
        // when tabbing backward into the iframe, it will have the html element focussed
        // initially, but then passes focus to the input
        setTimeout(() => {
            const activeEl = getActiveElement();

            if (activeEl !== document.body && activeEl !== document.documentElement) {
                return;
            }

            applyFocusWorkaroundForSafari(input);

            // for Safari, setting the selection range is enough to give
            // it focus, but Firefox requires an explicit focus call.
            // Also, just calling `focus` on Safari does not work at all
            input.focus();
        }, 1);
    });
}

// Function that returns the field value in the correct format
export function formatFieldValue(value : string | Card) : string | Card {
    let newValue;
    // Single card field case
    if (typeof value === 'object') {
        newValue = { ...value };
    // Individual field case
    } else {
        newValue = value;
    }
    return newValue;
}

// Parse errors from ProcessPayment GQL mutation
export function parseGQLErrors(errorsObject : Object) : {| parsedErrors : $ReadOnlyArray<string>, errors : $ReadOnlyArray<Object>|} {
    const { data } = errorsObject;

    const parsedErrors = [];
    const errors = [];

    if (Array.isArray(data) && data.length) {
        data.forEach(e => {
            const { details } = e;

            if (Array.isArray(details) && details.length) {
                details.forEach(d => {
                    errors.push(d);
                    
                    let parsedError;
                    if (d.field && d.issue && d.description) {
                        parsedError = GQL_ERRORS[d.field][d.issue] ?? `${ d.issue }: ${ d.description }`;
                    } else if (d.issue && d.description) {
                        parsedError = GQL_ERRORS[d.issue] ?? `${ d.issue }: ${ d.description }`;
                    }
                    
                    if (parsedError) {
                        parsedErrors.push(parsedError);
                    }
                    
                });
            }
        });
    }

    return {
        errors,
        parsedErrors
    };
}
