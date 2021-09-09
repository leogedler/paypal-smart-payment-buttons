/* @flow */
/** @jsx h */

import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import {
    maskCard,
    maskExpiry,
    defaultStyles,
    defaultInputStyle,
    getStyles,
    styleToString,
    defaultPlaceholders,
    checkCardNumber,
    checkExpiry,
    checkCVV,
    isNumberKey
} from '../lib';
import type { CardStyle, Card } from '../types';

type CardFieldProps = {|
    cspNonce : string,
    onChange : ({| value : Card, valid : boolean |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardFieldProps) : mixed {
    const [ number, setNumber ] = useState('');
    const [ cvv, setCVV ] = useState('');
    const [ expiry, setExpiry ] = useState('');
    const [ isValid, setIsValid ] = useState(true);
    const [ cursorStart, setCursorStart ] = useState(0);
    const [ cursorEnd, setCursorEnd ] = useState(0);
    const [ isNumberValid, setIsNumberValid ] = useState(true);
    const [ isExpiryValid, setIsExpiryValid ] = useState(true);
    const [ isCvvValid, setIsCvvValid ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);
    const inputRef = useRef();

    const compousedStyles = { ...defaultStyles,  ...generalStyles };


    useEffect(() => {

        const valid = Boolean(isNumberValid && isCvvValid && isExpiryValid);

        setIsNumberValid(checkCardNumber(number));
        setIsExpiryValid(checkExpiry(expiry));
        setIsCvvValid(checkCVV(cvv));
        setIsValid(valid);
        onChange({ value: { number, cvv, expiry }, valid });

        inputRef.current.selectionStart = cursorStart;
        inputRef.current.selectionEnd = cursorEnd;

    }, [ number, cvv, expiry, isNumberValid, isCvvValid, isExpiryValid, isValid, cursorStart, cursorEnd ]);

    const setValueAndCursor = (event : Event) => {
        // $FlowFixMe
        const { value, selectionStart, selectionEnd } = event.target;
        
        let startCursorPosition = selectionStart;
        let endCursorPosition = selectionEnd;
        if (value.length === startCursorPosition) {
            startCursorPosition += 1;
            endCursorPosition += 1;
        }

        const maskedValue = maskCard(value);
        setCursorStart(startCursorPosition);
        setCursorEnd(endCursorPosition);
        setNumber(maskedValue);
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <input
                ref={ inputRef }
                type='text'
                className={ isNumberValid ? 'number valid' : 'number invalid' }
                placeholder={ placeholder.number ?? defaultPlaceholders.number }
                value={ number }
                style={ inputStyles }
                maxLength='20'
                onKeyDown={ isNumberKey }
                onKeyUp={ setValueAndCursor }
            />

            <input
                type='text'
                className={ isExpiryValid ? 'expiry valid' : 'expiry invalid' }
                placeholder={ placeholder.expiry ?? defaultPlaceholders.expiry }
                value={ maskExpiry(expiry) }
                style={ inputStyles }
                maxLength='7'
                onKeyDown={ isNumberKey }
                onKeyUp={ event => setExpiry(event.target.value) }
            />

            <input
                type='text'
                className={ isCvvValid ? 'cvv valid' : 'cvv invalid' }
                placeholder={ placeholder.cvv ?? defaultPlaceholders.cvv }
                value={ cvv }
                style={ inputStyles }
                maxLength='3'
                onKeyDown={ isNumberKey }
                onKeyUp={ event => setCVV(event.target.value) }
            />
        </Fragment>
    );
}

type CardNumberFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean |}) => void,
    styleObject : CardStyle,
   placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardNumberField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardNumberFieldProps) : mixed {
    const [ number, setNumber ] = useState('');
    const [ isNumberValid, setIsNumberValid ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);
    const [ cursorStart, setCursorStart ] = useState(0);
    const [ cursorEnd, setCursorEnd ] = useState(0);

    const compousedStyles = { ...{ input: defaultInputStyle },  ...generalStyles };

    useEffect(() => {
        setIsNumberValid(number);
        const valid = Boolean(number);
        const value = number;
        onChange({ value, valid });
    }, [ number, cursorStart, cursorEnd ]);

    const setValueAndCursor = (event : Event) => {
        // $FlowFixMe
        const { value, selectionStart, selectionEnd } = event.target;
        
        let startCursorPosition = selectionStart;
        let endCursorPosition = selectionEnd;
        if (value.length === startCursorPosition) {
            startCursorPosition += 1;
            endCursorPosition += 1;
        }

        const maskedValue = maskCard(value);
        setCursorStart(startCursorPosition);
        setCursorEnd(endCursorPosition);
        setNumber(maskedValue);
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <input
                type='text'
                className={ isNumberValid ? 'number valid' : 'number invalid' }
                placeholder={ placeholder.number ?? defaultPlaceholders.number }
                value={ maskCard(number) }
                style={ inputStyles }
                onKeyDown={ isNumberKey }
                onKeyUp={ setValueAndCursor }
            />
        </Fragment>
    );
}

type CardCvvFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardCVVField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardCvvFieldProps) : mixed {
    const [ cvv, setCvv ] = useState('');
    const [ isCvvValid, setIsCvvValid ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);
    
    const compousedStyles = { ...{ input: defaultInputStyle },  ...generalStyles };

    useEffect(() => {
        setIsCvvValid(cvv);
        const valid = Boolean(cvv);
        const value = cvv;
        onChange({ value, valid });
    }, [ cvv ]);

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <input
                type='text'
                className={ isCvvValid ? 'cvv valid' : 'cvv invalid' }
                placeholder={ placeholder.cvv ?? defaultPlaceholders.cvv }
                value={ cvv }
                style={ inputStyles }
                onKeyDown={ isNumberKey }
                onKeyUp={ event => setCvv(event.target.value) }
            />
        </Fragment>
    );
}

type CardExpiryFieldProps = {|
    cspNonce : string,
    onChange : ({| value : string, valid : boolean |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardExpiryField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardExpiryFieldProps) : mixed {
    const [ expiry, setExpiry ] = useState('');
    const [ isExpiryValid, setIsExpiryValid ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);

    const compousedStyles = { ...{ input: defaultInputStyle },  ...generalStyles };

    useEffect(() => {
        setIsExpiryValid(expiry);
        const valid = Boolean(expiry);
        const value = expiry;
        onChange({ value, valid });
    }, [ expiry ]);

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <input
                type='text'
                className={ isExpiryValid ? 'expiry valid' : 'expiry invalid' }
                placeholder={ placeholder.expiry ?? defaultPlaceholders.expiry }
                value={ maskExpiry(expiry) }
                style={ inputStyles }
                onKeyDown={ isNumberKey }
                onKeyUp={ event => setExpiry(event.target.value) }
            />
        </Fragment>
    );
}
