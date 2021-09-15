/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { checkCVV } from '../lib';

type CardCvvProps = {|
    ref? : () => void,
    type : string,
    className : string,
    placeholder : mixed,
    style : mixed,
    maxLength : string,
    onChange : (cvvEvent : {| event : Event, cardCvv : string |}) => void,
    onFocus? : (event : Event) => void,
    onBlur? : (event : Event) => void,
    onValidityChange? : (cvvValidity : boolean) => void
|};


export function CardCVV({ ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange } : CardCvvProps) : mixed {
    const [ cvv, setCvv ] = useState('');
    const [ isCvvValid, setIsCvvValid ] = useState(true);

    useEffect(() => {
        setIsCvvValid(checkCVV(cvv));

        if (typeof onValidityChange === 'function') {
            onValidityChange(isCvvValid);
        }

    }, [ cvv, isCvvValid ]);

    const setCvvValue : mixed = (event : Event) : mixed => {
        // $FlowFixMe
        const { value } = event.target;
        setCvv(value);

        onChange({ event, cardCvv: value  });
    };

    return (
        <input
            ref={ ref }
            type={ type }
            className={ className }
            placeholder={ placeholder }
            value={ cvv }
            style={ style }
            maxLength={ maxLength }
            onInput={ setCvvValue }
            onFocus={ onFocus }
            onBlur={ onBlur }
        />
    );
}
