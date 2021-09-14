/* @flow */
/** @jsx h */

import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import {
    maskCard,
    maskDate,
    defaultStyles,
    defaultInputStyle,
    getStyles,
    styleToString,
    defaultPlaceholders,
    checkCardNumber,
    checkExpiry,
    checkCVV,
    detectCardType,
    defaultCardType,
    setErrors,
    removeNonDigits,
    removeSpaces,
    checkForNonDigits
} from '../lib';
import type { CardStyle, Card } from '../types';

type CardFieldProps = {|
    cspNonce : string,
    onChange : ({| value : Card, valid : boolean, errors : $ReadOnlyArray<string> |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardFieldProps) : mixed {
    const [ keyStroke, setKeyStroke ] = useState(0);
    const [ number, setNumber ] = useState('');
    const [ maskedNumber, setMaskedNumber ] = useState('');
    const [ cvv, setCVV ] = useState('');
    const [ expiry, setExpiry ] = useState('');
    const [ isValid, setIsValid ] = useState(true);
    const [ cardType, setCardType ] = useState(defaultCardType);
    const [ cursorStart, setCursorStart ] = useState(0);
    const [ cursorEnd, setCursorEnd ] = useState(0);
    const [ isNumberValid, setIsNumberValid ] = useState(true);
    const [ isExpiryValid, setIsExpiryValid ] = useState(true);
    const [ isCvvValid, setIsCvvValid ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);
    const inputRef = useRef();

    const compousedStyles = { ...defaultStyles,  ...generalStyles };

    useEffect(() => {

        const valid = Boolean(isNumberValid.isValid && isCvvValid && isExpiryValid);

        setIsNumberValid(checkCardNumber(number, cardType));
        setIsExpiryValid(checkExpiry(expiry));
        setIsCvvValid(checkCVV(cvv));
        setIsValid(valid);

        const errors = setErrors({ isNumberValid: isNumberValid.isValid, isCvvValid, isExpiryValid });
        onChange({ value: { number, cvv, expiry }, valid, errors });

    }, [
        number,
        maskedNumber,
        cvv,
        expiry,
        isCvvValid,
        isExpiryValid,
        isValid,
        cursorStart,
        cursorEnd,
        JSON.stringify(isNumberValid),
        JSON.stringify(cardType),
        keyStroke
    ]);

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

        if (maskedValue.length !== maskedNumber.length && maskedValue.length === selectionStart + 1) {
            startCursorPosition += 1;
            endCursorPosition += 1;
        }

        const element = event.target;
        window.requestAnimationFrame(() => {
            // $FlowFixMe
            element.selectionStart = startCursorPosition;
            // $FlowFixMe
            element.selectionEnd = startCursorPosition;
        });

        setCursorStart(startCursorPosition);
        setCursorEnd(endCursorPosition);
        setNumber(removeSpaces(value));
        setMaskedNumber(maskedValue);
        setKeyStroke(keyStroke + 1);
    };

    const onBlur : mixed = () : mixed => {
        setNumber(number);
        const trimmedValue = removeSpaces(maskedNumber);
        if (isNumberValid.isValid) {
            // eslint-disable-next-line unicorn/prefer-string-slice
            setMaskedNumber(`${ trimmedValue.substring(trimmedValue.length - 4) }`);
        }
    };

    const setDateMask : mixed = (event : Event) : mixed => {
        // $FlowFixMe
        const { value } = event.target;
        const mask = maskDate(value);
        setExpiry(mask);
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <input
                ref={ inputRef }
                type='text'
                className={ isNumberValid.isPossibleValid ? 'number valid' : 'number invalid' }
                placeholder={ placeholder.number ?? defaultPlaceholders.number }
                value={ maskedNumber }
                style={ inputStyles }
                maxLength='24'
                onInput={ setValueAndCursor }
                onFocus={ () => setMaskedNumber(maskCard(number)) }
                onBlur={ onBlur }
            />

            <input
                type='text'
                className={ isExpiryValid ? 'expiry valid' : 'expiry invalid' }
                placeholder={ placeholder.expiry ?? defaultPlaceholders.expiry }
                value={ expiry }
                style={ inputStyles }
                maxLength='7'
                onInput={ setDateMask }
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
