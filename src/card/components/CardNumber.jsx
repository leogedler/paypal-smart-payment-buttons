/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import {
    maskCard,
    checkForNonDigits,
    removeNonDigits,
    defaultCardType,
    detectCardType,
    removeSpaces,
    checkCardNumber
} from '../lib';
import type { CardType } from '../types';

type CardNumberProps = {|
    ref? : () => void,
    type : string,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    onChange : (numberEvent : {| event : Event, cardNumber : string, cardMaskedNumber : string, cardType : CardType|}) => void,
    onFocus? : (event : Event) => void,
    onBlur? : (event : Event) => void,
    onValidityChange? : (numberValidity : {| isValid : boolean, isPossibleValid : boolean |}) => void
|};

export function CardNumber({ ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardNumberProps) : mixed {

    const [ keyStroke, setKeyStroke ] = useState(0);
    const [ maskedNumber, setMaskedNumber ] = useState('');
    const [ cursorStart, setCursorStart ] = useState(0);
    const [ cursorEnd, setCursorEnd ] = useState(0);
    const [ cardType, setCardType ] = useState(defaultCardType);
    const [ number, setNumber ] = useState('');
    const [ isNumberValid, setIsNumberValid ] = useState(true);


    useEffect(() => {
        setIsNumberValid(checkCardNumber(number, cardType));
        if (typeof onValidityChange === 'function') {
            onValidityChange(isNumberValid);
        }
    }, [ number, maskedNumber, keyStroke, JSON.stringify(isNumberValid) ]);


    const setValueAndCursor : mixed = (event : Event) : mixed => {
        // $FlowFixMe
        const { value: rawValue, selectionStart, selectionEnd } = event.target;

        let startCursorPosition = selectionStart;
        let endCursorPosition = selectionEnd;
        
        if (checkForNonDigits(rawValue)) {
            startCursorPosition = cursorStart;
            endCursorPosition = cursorEnd;
        }
        
        const value = removeNonDigits(rawValue);
        const maskedValue = maskCard(value);

        setCardType(detectCardType(value));

        if (maskedValue.length !== maskedNumber.length && maskedValue.length === selectionStart + 1) {
            startCursorPosition += 1;
            endCursorPosition += 1;
        }

        const element = event.target;
        window.requestAnimationFrame(() => {
            // $FlowFixMe
            element.selectionStart = startCursorPosition;
            // $FlowFixMe
            element.selectionEnd = startCursorPosition;
        });

        setCursorStart(startCursorPosition);
        setCursorEnd(endCursorPosition);
        setNumber(removeSpaces(value));
        setMaskedNumber(maskedValue);
        setKeyStroke(keyStroke + 1);

        onChange({ event, cardNumber: number, cardMaskedNumber: maskedNumber, cardType });
    };

    const onBlurEvent : mixed = (event : Event) : mixed => {
        const trimmedValue = removeSpaces(maskedNumber);
        if (isNumberValid.isValid) {
            // eslint-disable-next-line unicorn/prefer-string-slice
            setMaskedNumber(`${ trimmedValue.substring(trimmedValue.length - 4) }`);
        }

        if (typeof onBlur === 'function') {
            onBlur(event);
        }
    };

    const onFocusEvent : mixed = (event : Event) : mixed => {
        setMaskedNumber(maskCard(number));
        if (typeof onFocus === 'function') {
            onFocus(event);
        }
    };

    return (
        <input
            ref={ ref }
            type={ type }
            className={ className }
            placeholder={ placeholder }
            value={ maskedNumber }
            style={ style }
            maxLength={ maxLength }
            onInput={ setValueAndCursor }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
        />
    );
}
