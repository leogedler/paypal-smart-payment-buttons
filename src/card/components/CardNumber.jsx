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
    checkCardNumber,
    moveCursor,
    defaultNavigation
} from '../lib';
import type { CardNumberChangeEvent, CardValidity, CardNavigation } from '../types';

type CardNumberProps = {|
    name : string,
    ref : mixed,
    type : string,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    navigation : CardNavigation,
    onChange : (numberEvent : CardNumberChangeEvent) => void,
    onFocus : (event : Event) => void,
    onBlur : (event : Event) => void,
    onValidityChange? : (numberValidity : CardValidity) => void
|};

export function CardNumber({ name = 'number', navigation = defaultNavigation, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardNumberProps) : mixed {
    const [ cardType, setCardType ] = useState(defaultCardType);

    const [ inputState, setInputState ] = useState({ inputValue: '', maskedInputValue: '', cursorStart: 0, cursorEnd: 0, keyStrokeCount: 0 });
    const [ isNumberValid, setIsNumberValid ] = useState({ isValid: false, isPossibleValid: true });

    const { inputValue, maskedInputValue, cursorStart, cursorEnd, keyStrokeCount } = inputState;
    const { isValid, isPossibleValid } = isNumberValid;


    useEffect(() => {
        setIsNumberValid(checkCardNumber(inputValue, cardType));
    }, [ inputValue, maskedInputValue ]);


    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange(isNumberValid);
        }

        if (isValid && maskedInputValue.length === cursorStart) {
            navigation.next();
        }

    }, [ isValid, isPossibleValid ]);


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

        if (maskedInputValue.length !== maskedValue.length && maskedValue.length === selectionStart + 1) {
            startCursorPosition += 1;
            endCursorPosition += 1;
        }

        moveCursor(event, startCursorPosition, endCursorPosition);

        setInputState({ inputValue: value, maskedInputValue: maskedValue, cursorStart: startCursorPosition, cursorEnd: endCursorPosition, keyStrokeCount: keyStrokeCount + 1 });

        onChange({ event, cardNumber: inputValue, cardMaskedNumber: maskedInputValue, cardType });
    };

    const onBlurEvent : mixed = (event : Event) : mixed => {
        const trimmedValue = removeSpaces(maskedInputValue);
        if (isNumberValid.isValid) {
            // eslint-disable-next-line unicorn/prefer-string-slice
            setInputState({ ...inputState, maskedInputValue: `${ trimmedValue.substring(trimmedValue.length - 4) }` });
        }

        if (typeof onBlur === 'function') {
            onBlur(event);
        }

    };

    const onFocusEvent : mixed = (event : Event) : mixed => {
        setInputState({ ...inputState, maskedInputValue: maskCard(inputValue) });

        if (typeof onFocus === 'function') {
            onFocus(event);
        }
    };

    return (
        <input
            name={ name }
            ref={ ref }
            type={ type }
            className={ className }
            placeholder={ placeholder }
            value={ maskedInputValue }
            style={ style }
            maxLength={ maxLength }
            onInput={ setValueAndCursor }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
        />
    );
}
