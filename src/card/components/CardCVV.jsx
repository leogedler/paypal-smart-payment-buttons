/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { checkCVV, removeNonDigits, defaultNavigation, initInputState } from '../lib';
import type { CardType, CardCvvChangeEvent, CardNavigation, FieldValidity, InputState, InputEvent } from '../types';

type CardCvvProps = {|
    name : string,
    ref : mixed,
    type : string,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    cardType : CardType,
    navigation : CardNavigation,
    onChange : (cvvEvent : CardCvvChangeEvent) => void,
    onFocus : (event : InputEvent) => void,
    onBlur : (event : InputEvent) => void,
    allowNaviation : boolean,
    onValidityChange? : (numberValidity : FieldValidity) => void
|};


export function CardCVV({ name = 'cvv', navigation = defaultNavigation, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange, cardType, allowNaviation = false } : CardCvvProps) : mixed {
    const [ inputState, setInputState ] : [ InputState, (InputState) => mixed ] = useState(initInputState);
    const { inputValue, keyStrokeCount, isValid, isPossibleValid } = inputState;

    useEffect(() => {
        const validity = checkCVV(inputValue, cardType);
        setInputState({ ...inputState, ...validity });
    }, [ inputValue ]);

    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange({ isValid, isPossibleValid });
        }
        if (allowNaviation && inputValue && isValid) {
            navigation.next();
        }
    }, [ isValid, isPossibleValid ]);

    const setCvvValue : mixed = (event : InputEvent) : mixed => {
        const { value : rawValue } = event.target;
        const value = removeNonDigits(rawValue);

        setInputState({
            ...inputState,
            inputValue:       value,
            maskedInputValue: value,
            keyStrokeCount:   keyStrokeCount + 1
        });

        onChange({ event, cardCvv: value  });
    };

    const onKeyUpEvent : mixed = (event : InputEvent) => {
        const { target: { value, selectionStart }, key } = event;

        if (allowNaviation) {
            if (selectionStart === 0 && [ 'Backspace', 'ArrowLeft' ].includes(key)) {
                navigation.previous();
            }
            if (selectionStart === value.length && [ 'ArrowRight' ].includes(key)) {
                navigation.next();
            }
        }
    };

    const onFocusEvent : mixed = (event : InputEvent) => {
        if (typeof onFocus === 'function') {
            onFocus(event);
        }
        if (!isValid) {
            setInputState({ ...inputState, isPossibleValid: true });
        }
    };

    const onBlurEvent : mixed = (event : InputEvent) => {
        if (typeof onBlur === 'function') {
            onBlur(event);
        }
        if (!isValid) {
            setInputState({ ...inputState, isPossibleValid: false });
        }
    };

    return (
        <input
            name={ name }
            ref={ ref }
            type={ type }
            className={ className }
            placeholder={ placeholder }
            value={ inputValue }
            style={ style }
            maxLength={ maxLength }
            onKeyUp={ onKeyUpEvent }
            onInput={ setCvvValue }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
        />
    );
}
