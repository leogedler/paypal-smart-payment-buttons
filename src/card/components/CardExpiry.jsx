/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { maskDate, checkExpiry } from '../lib';

type CardExpiryProps = {|
    ref? : () => void,
    type : string,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    onChange : (expiryEvent : {| event : Event, maskedDate : string, date : string |}) => void,
    onFocus? : (event : Event) => void,
    onBlur? : (event : Event) => void,
    onValidityChange? : (expiryValidity : boolean) => void
|};


export function CardExpiry({ ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardExpiryProps) : mixed {
    const [ expiry, setExpiry ] = useState('');
    const [ isExpiryValid, setIsExpiryValid ] = useState(true);

    useEffect(() => {
        setIsExpiryValid(checkExpiry(expiry));

        if (typeof onValidityChange === 'function') {
            onValidityChange(isExpiryValid);
        }

    }, [ expiry, isExpiryValid ]);

    const setDateMask : mixed = (event : Event) : mixed => {
        // $FlowFixMe
        const { value } = event.target;
        const mask = maskDate(value);
        setExpiry(mask);

        onChange({ event, date: value, maskedDate: mask });
    };

    return (
        <input
            ref={ ref }
            type={ type }
            className={ className }
            placeholder={ placeholder }
            value={ expiry }
            style={ style }
            maxLength={ maxLength }
            onInput={ setDateMask }
            onFocus={ onFocus }
            onBlur={ onBlur }
        />
    );
}
