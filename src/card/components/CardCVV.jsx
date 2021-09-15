/* @flow */
/** @jsx h */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { checkCVV, removeNonDigits, defaultNavigation } from '../lib';
import type { CardType, CardCvvChangeEvent, CardNavigation } from '../types';

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
    onFocus : (event : Event) => void,
    onBlur : (event : Event) => void,
    onValidityChange? : (cvvValidity : boolean) => void
|};


export function CardCVV({ name = 'cvv', navigation = defaultNavigation, ref, type, className, placeholder, style, maxLength, onChange, onFocus, onBlur, onValidityChange, cardType } : CardCvvProps) : mixed {
    const [ keyStroke, setKeyStroke ] = useState(0);
    const [ cvv, setCvv ] = useState('');
    const [ isSwitched, setSwitch ] = useState(false);
    const [ isCvvValid, setIsCvvValid ] = useState(true);

    useEffect(() => {
        setIsCvvValid(checkCVV(cvv, cardType));
    }, [ cvv, isCvvValid, keyStroke ]);

    useEffect(() => {
        if (typeof onValidityChange === 'function') {
            onValidityChange(isCvvValid);
            if (cvv && isCvvValid) {
                // $Flow(InferError)
                if (!isSwitched) {
                    navigation.next();
                    setSwitch(true);
                }
            } else {
                setSwitch(false);
            }
        }
    }, [ isCvvValid ]);

    const setCvvValue : mixed = (event : Event) : mixed => {
        // $FlowFixMe[prop-missing]
        const { value : rawValue } = event.target;
        const value = removeNonDigits(rawValue);

        setCvv(value);
        setKeyStroke(keyStroke + 1);

        onChange({ event, cardCvv: value  });
    };

    const onKeyUp : mixed = (event : Event) => {
        // $FlowFixMe[prop-missing]
        const { target: { selectionStart }, key } = event;
        if (selectionStart === 0 && key === 'Backspace') {
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
            value={ cvv }
            style={ style }
            maxLength={ maxLength }
            onKeyUp={ onKeyUp }
            onInput={ setCvvValue }
            onFocus={ onFocus }
            onBlur={ onBlur }
        />
    );
}
