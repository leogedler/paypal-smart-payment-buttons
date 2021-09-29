/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';


import {
    maskCard,
    checkForNonDigits,
    removeNonDigits,
    detectCardType,
    checkCardNumber,
    moveCursor,
    defaultNavigation,
    defaultInputState,
    navigateOnKeyDown,
    maskValidCard
} from '../lib';
import type {
    CardNumberChangeEvent,
    FieldValidity,
    CardNavigation,
    InputState,
    CardType,
    InputEvent
} from '../types';
import {  DEFAULT_CARD_TYPE } from '../constants';

type CardNumberProps = {|
    name : string,
    ref : mixed,
    type : string,
    state? : InputState,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    navigation? : CardNavigation,
    allowNavigation? : boolean,
    onChange : (numberEvent : CardNumberChangeEvent) => void,
    onFocus? : (event : InputEvent) => void,
    onBlur? : (event : InputEvent) => void,
    onValidityChange? : (numberValidity : FieldValidity) => void
|};

export function CardNumber({ name = 'number', navigation = defaultNavigation, state, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange, allowNavigation = false } : CardNumberProps) : mixed {
    const [ cardType, setCardType ] : [ CardType, (CardType) => mixed ] = useState(DEFAULT_CARD_TYPE);
    const [ inputState, setInputState ] : [ InputState, (InputState) => mixed ] = useState({ ...defaultInputState, ...state });

    const { inputValue, maskedInputValue, cursorStart, cursorEnd, keyStrokeCount, isValid, isPossibleValid } = inputState;

    useEffect(() => {
        const validity = checkCardNumber(inputValue, cardType);
        setInputState({ ...inputState, ...validity });
    }, [ inputValue, maskedInputValue ]);


    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange({ isValid, isPossibleValid });
        }

        if (allowNavigation && inputValue && isValid && maskedInputValue.length === cursorStart) {
            navigation.next();
        }

    }, [ isValid, isPossibleValid ]);


    const setValueAndCursor : mixed = (event : InputEvent) : mixed => {
        const { value: rawValue, selectionStart, selectionEnd } = event.target;
        const value = removeNonDigits(rawValue);
        const detectedCardType = detectCardType(value);
        const maskedValue = maskCard(value);

        let startCursorPosition = selectionStart;
        let endCursorPosition = selectionEnd;
        
        if (checkForNonDigits(rawValue)) {
            startCursorPosition = cursorStart;
            endCursorPosition = cursorEnd;
        }
        
        if (maskedInputValue.length !== maskedValue.length && maskedValue.length === selectionStart + 1) {
            startCursorPosition += 1;
            endCursorPosition += 1;
        }

        moveCursor(event.target, startCursorPosition, endCursorPosition);

        setCardType(detectedCardType);
        setInputState({
            ...inputState,
            inputValue:       value,
            maskedInputValue: maskedValue,
            cursorStart:      startCursorPosition,
            cursorEnd:        endCursorPosition,
            keyStrokeCount:   keyStrokeCount + 1
        });

        onChange({ event, cardNumber: value, cardMaskedNumber: maskedValue, cardType: detectedCardType });
    };

    const onFocusEvent : mixed = (event : InputEvent) : mixed => {
        if (typeof onFocus === 'function') {
            onFocus(event);
        }

        const maskedValue = maskCard(inputValue);
        const newState = { ...inputState, maskedInputValue: maskedValue };
        
        if (isValid) {
            // Timeout needed to wait for the marked replacement
            setTimeout(() => moveCursor(event.target, maskedValue.length, maskedValue.length));
        } else {
            newState.isPossibleValid = true;
        }

        setInputState({ ...newState });
    };

    const onBlurEvent : mixed = (event : InputEvent) : mixed => {
        const newState = { ...inputState };

        if (isValid) {
            newState.maskedInputValue = maskValidCard(maskedInputValue);
        } else {
            newState.isPossibleValid = false;
        }

        if (typeof onBlur === 'function') {
            onBlur(event);
        }

        setInputState({ ...newState });

    };

    const onKeyDownEvent : mixed = (event : InputEvent) => {
        if (allowNavigation) {
            navigateOnKeyDown(event, navigation);
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
            onKeyDown={ onKeyDownEvent }
        />
    );
}
