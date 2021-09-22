/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { maskDate, checkExpiry, removeNonDigits, removeDateMask, defaultNavigation, initInputState } from '../lib';
import type { CardExpiryChangeEvent, CardNavigation, FieldValidity, InputState } from '../types';

type CardExpiryProps = {|
    name : string,
    ref : () => void,
    type : string,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    navigation : CardNavigation,
    onChange : (expiryEvent : CardExpiryChangeEvent) => void,
    onFocus? : (event : Event) => void,
    onBlur? : (event : Event) => void,
    onValidityChange? : (numberValidity : FieldValidity) => void
|};


export function CardExpiry({ name = 'expiry', navigation = defaultNavigation, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardExpiryProps) : mixed {
    const [ inputState, setInputState ] : [ InputState, (InputState) => mixed ] = useState(initInputState);
    const { inputValue, maskedInputValue, keyStrokeCount, isValid, isPossibleValid } = (inputState : InputState);


    useEffect(() => {
        const validity = checkExpiry(maskedInputValue);
        setInputState({ ...inputState, ...validity });
    }, [ inputValue, maskedInputValue ]);

    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange({ isValid, isPossibleValid });
        }

        if (maskedInputValue && isValid) {
            navigation.next();
        }
    }, [ isValid, isPossibleValid ]);

    const setDateMask : mixed = (event : Event) : mixed => {
        // $FlowFixMe
        const { value : rawValue } = event.target;
        const value = removeNonDigits(rawValue);
        const mask = maskDate(value);

        setInputState({
            ...inputState,
            inputValue:       rawValue,
            maskedInputValue: mask,
            keyStrokeCount:   keyStrokeCount + 1
        });

        onChange({ event, date: value, maskedDate: mask });

    };

    const onKeyUp : mixed = (event : Event) => {
        // $FlowFixMe
        const { target: { value }, key } = event;

        const last = value.trim().slice(-1);
        if (last === '/' && key === 'Backspace') {
            const month = removeDateMask(value);
            setInputState({ ...inputState, inputValue: value, maskedInputValue: month });
        }

        if (value === '' && key === 'Backspace') {
            navigation.previous();
        }
    };

    const onFocusEvent : mixed = (event : Event) => {
        if (typeof onFocus === 'function') {
            onFocus(event);
        }
        if (!isValid) {
            setInputState({ ...inputState, isPossibleValid: true });
        }
    };

    const onBlurEvent : mixed = (event : Event) => {
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
            value={ maskedInputValue }
            style={ style }
            maxLength={ maxLength }
            onKeyUp={ onKeyUp }
            onInput={ setDateMask }
            onFocus={ onFocusEvent }
            onBlur={ onBlurEvent }
        />
    );
}
