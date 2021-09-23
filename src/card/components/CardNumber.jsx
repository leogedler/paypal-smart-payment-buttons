/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';


import {
    maskCard,
    checkForNonDigits,
    removeNonDigits,
    detectCardType,
    removeSpaces,
    checkCardNumber,
    moveCursor,
    defaultNavigation,
    initInputState
} from '../lib';
import type {
    CardNumberChangeEvent,
    FieldValidity,
    CardNavigation,
    InputState,
    CardType
} from '../types';
import {  DEFAULT_CARD_TYPE } from '../constants';

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
    onValidityChange? : (numberValidity : FieldValidity) => void
|};

export function CardNumber({ name = 'number', navigation = defaultNavigation, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardNumberProps) : mixed {
    const [ cardType, setCardType ] : [ CardType, (CardType) => mixed ] = useState(DEFAULT_CARD_TYPE);
    const [ inputState, setInputState ] : [ InputState, (InputState) => mixed ] = useState(initInputState);

    const { inputValue, maskedInputValue, cursorStart, cursorEnd, keyStrokeCount, isValid, isPossibleValid } = inputState;

    useEffect(() => {
        const validity = checkCardNumber(inputValue, cardType);
        setInputState({ ...inputState, ...validity });
    }, [ inputValue, maskedInputValue ]);


    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange({ isValid, isPossibleValid });
        }

        if (inputValue && isValid && maskedInputValue.length === cursorStart) {
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

        setInputState({
            ...inputState,
            inputValue:       value,
            maskedInputValue: maskedValue,
            cursorStart:      startCursorPosition,
            cursorEnd:        endCursorPosition,
            keyStrokeCount:   keyStrokeCount + 1
        });

        onChange({ event, cardNumber: inputValue, cardMaskedNumber: maskedInputValue, cardType });
    };

    const onFocusEvent : mixed = (event : Event) : mixed => {
        if (typeof onFocus === 'function') {
            onFocus(event);
        }

        const state = { ...inputState, maskedInputValue: maskCard(inputValue) };
        
        if (!isValid) {
            state.isPossibleValid = true;
        }

        setInputState({ ...state });
    };

    const onBlurEvent : mixed = (event : Event) : mixed => {
        const trimmedValue = removeSpaces(maskedInputValue);

        const state = { ...inputState };

        if (isValid) {
            // eslint-disable-next-line unicorn/prefer-string-slice
            state.maskedInputValue = `${ trimmedValue.substring(trimmedValue.length - 4) }`;
        }

        if (typeof onBlur === 'function') {
            onBlur(event);
        }

        if (!isValid) {
            state.isPossibleValid = false;
        }

        setInputState({ ...state });

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
