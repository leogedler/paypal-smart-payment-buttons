/* @flow */
/** @jsx h */

import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import {
    maskCard,
    maskDate,
    defaultStyles,
    defaultInputStyle,
    getStyles,
    styleToString,
    defaultPlaceholders,
    checkCVV,
    setErrors
} from '../lib';
import type { CardStyle, Card } from '../types';

import { CardNumber } from './CardNumber';
import { CardExpiry } from './CardExpiry';

type CardFieldProps = {|
    cspNonce : string,
    onChange : ({| value : Card, valid : boolean, errors : $ReadOnlyArray<string> |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardFieldProps) : mixed {
    const [ number, setNumber ] = useState('');
    const [ cvv, setCVV ] = useState('');
    const [ expiry, setExpiry ] = useState('');
    const [ isValid, setIsValid ] = useState(true);
    const [ isNumberValid, setIsNumberValid ] = useState(true);
    const [ isExpiryValid, setIsExpiryValid ] = useState(true);
    const [ isCvvValid, setIsCvvValid ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);

    const compousedStyles = { ...defaultStyles,  ...generalStyles };

    useEffect(() => {

        const valid = Boolean(isNumberValid.isValid && isCvvValid && isExpiryValid);

        setIsCvvValid(checkCVV(cvv));
        setIsValid(valid);

        const errors = setErrors({ isNumberValid: isNumberValid.isValid, isCvvValid, isExpiryValid });
        onChange({ value: { number, cvv, expiry }, valid, errors });

    }, [
        number,
        cvv,
        expiry,
        isCvvValid,
        isExpiryValid,
        isValid,
        JSON.stringify(isNumberValid)
    ]);

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <CardNumber
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ isNumberValid.isPossibleValid ? 'number valid' : 'number invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.number ?? defaultPlaceholders.number }
                maxLength='24'
                onChange={ ({ cardNumber }) => setNumber(cardNumber) }
                onValidityChange={ (numberValidity) => setIsNumberValid(numberValidity) }
            />

            <CardExpiry
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ isExpiryValid ? 'expiry valid' : 'expiry invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.expiry ?? defaultPlaceholders.expiry }
                maxLength='7'
                onChange={ ({ maskedDate }) => setExpiry(maskedDate) }
                onValidityChange={ (expiryValidity) => setIsExpiryValid(expiryValidity) }
            />


            <input
                type='text'
                className={ isCvvValid ? 'cvv valid' : 'cvv invalid' }
                placeholder={ placeholder.cvv ?? defaultPlaceholders.cvv }
                value={ cvv }
                style={ inputStyles }
                maxLength='3'
                onInput={ event => setCVV(event.target.value) }
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
                maxLength='24'
                onInput={ setValueAndCursor }
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
                onInput={ event => setCvv(event.target.value) }
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
                value={ maskDate(expiry) }
                style={ inputStyles }
                onInput={ event => setExpiry(event.target.value) }
            />
        </Fragment>
    );
}
