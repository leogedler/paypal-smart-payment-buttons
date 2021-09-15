/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { maskDate, checkExpiry, removeNonDigits, removeDateMask, defaultNavigation } from '../lib';
import type { CardExpiryChangeEvent, CardNavigation } from '../types';

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
    onValidityChange? : (expiryValidity : boolean) => void
|};


export function CardExpiry({ name = 'expiry', navigation = defaultNavigation, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardExpiryProps) : mixed {
    const [ keyStroke, setKeyStroke ] = useState(0);
    const [ expiry, setExpiry ] = useState('');
    const [ isExpiryValid, setIsExpiryValid ] = useState(true);

    useEffect(() => {
        setIsExpiryValid(checkExpiry(expiry));
    }, [ expiry, keyStroke ]);

    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange(isExpiryValid);
        }

        if (isExpiryValid) {
            navigation.next();
        }
    }, [ isExpiryValid ]);

    const setDateMask : mixed = (event : Event) : mixed => {
        // $FlowFixMe
        const { value : rawValue } = event.target;
        const value = removeNonDigits(rawValue);
        const mask = maskDate(value);

        setExpiry(mask);
        setKeyStroke(keyStroke + 1);

        onChange({ event, date: value, maskedDate: mask });

    };

    const onKeyUp : mixed = (event : Event) => {
        // $FlowFixMe
        const { target: { value }, key } = event;

        const last = value.trim().slice(-1);
        if (last === '/' && key === 'Backspace') {
            const month = removeDateMask(value);
            setExpiry(month);
        }

        if (value === '' && key === 'Backspace') {
            navigation.previous();
        }
    };

    return (
        <input
            name={ name }
            ref={ ref }
            type={ type }
            className={ className }
            placeholder={ placeholder }
            value={ expiry }
            style={ style }
            maxLength={ maxLength }
            onKeyUp={ onKeyUp }
            onInput={ setDateMask }
            onFocus={ onFocus }
            onBlur={ onBlur }
        />
    );
}
