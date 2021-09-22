/* @flow */
/** @jsx h */

import { h, Fragment } from 'preact';
import { noop } from 'belter';
import { useState, useEffect, useRef } from 'preact/hooks';

import {
    defaultStyles,
    defaultCardType,
    defaultInputStyle,
    getStyles,
    styleToString,
    defaultPlaceholders,
    setErrors,
    getCvvLength,
    initFieldValidity
} from '../lib';
import type {
    CardStyle,
    Card,
    CardNumberChangeEvent,
    CardExpiryChangeEvent,
    CardCvvChangeEvent,
    FieldValidity,
    CardNavigation
} from '../types';

import { CardNumber } from './CardNumber';
import { CardExpiry } from './CardExpiry';
import { CardCVV } from './CardCVV';

type CardFieldProps = {|
    cspNonce : string,
    onChange : ({| value : Card, valid : boolean, errors : $ReadOnlyArray<string> |}) => void,
    styleObject : CardStyle,
    placeholder : {| number? : string, expiry? : string, cvv? : string  |}
|};

export function CardField({ cspNonce, onChange, styleObject = {}, placeholder = {} } : CardFieldProps) : mixed {
    const [ number, setNumber ] = useState('');
    const [ cvv, setCvv ] = useState('');
    const [ expiry, setExpiry ] = useState('');
    const [ isValid, setIsValid ] = useState(true);
    const [ numberValidity, setNumberValidity ] = useState(initFieldValidity);
    const [ expiryValid, setExpiryValidity ] = useState(initFieldValidity);
    const [ cvvValid, setCvvValidity ] = useState(initFieldValidity);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);
    const [ cardType, setCardType ] = useState(defaultCardType);
    const numberRef = useRef();
    const expiryRef = useRef();
    const cvvRef = useRef();

    const compousedStyles = { ...defaultStyles,  ...generalStyles };

    const cardNumberNavivation : CardNavigation = { next: () =>  expiryRef.current.base.focus(), previous: () => noop };
    const cardExpiryNavivation : CardNavigation = { next: () =>  cvvRef.current.base.focus(), previous: () => numberRef.current.base.focus() };
    const cardCvvNavivation : CardNavigation = { next: () =>  noop, previous: () => expiryRef.current.base.focus() };

    useEffect(() => {

        const valid = Boolean(numberValidity.isValid && cvvValid.isValid && expiryValid.isValid);

        setIsValid(valid);

        const errors = setErrors({ isNumberValid: numberValidity.isValid, isCvvValid: cvvValid.isValid, isExpiryValid: expiryValid.isValid });
        onChange({ value: { number, cvv, expiry }, valid, errors });

    }, [
        number,
        cvv,
        expiry,
        isValid,
        JSON.stringify(numberValidity),
        JSON.stringify(cvvValid),
        JSON.stringify(expiryValid),
        JSON.stringify(cardType)
    ]);

    const onChangeNumber : mixed = ({ cardNumber, cardType : type } : CardNumberChangeEvent) => {
        setNumber(cardNumber);
        setCardType(type);
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <CardNumber
                ref={ numberRef }
                navigation={ cardNumberNavivation }
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ numberValidity.isPossibleValid || numberValidity.isValid ? 'number valid' : 'number invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.number ?? defaultPlaceholders.number }
                maxLength='24'
                onChange={ onChangeNumber }
                onValidityChange={ (validity : FieldValidity) => setNumberValidity(validity) }
            />

            <CardExpiry
                ref={ expiryRef }
                navigation={ cardExpiryNavivation }
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ expiryValid.isPossibleValid || expiryValid.isValid ? 'expiry valid' : 'expiry invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.expiry ?? defaultPlaceholders.expiry }
                maxLength='7'
                onChange={ ({ maskedDate } : CardExpiryChangeEvent) => setExpiry(maskedDate) }
                onValidityChange={ (expiryValidity : FieldValidity) => setExpiryValidity(expiryValidity) }
            />

            <CardCVV
                ref={ cvvRef }
                navigation={ cardCvvNavivation }
                type='text'
                cardType={ cardType }
                // eslint-disable-next-line react/forbid-component-props
                className={ cvvValid.isPossibleValid || cvvValid.isValid ? 'cvv valid' : 'cvv invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.cvv ?? defaultPlaceholders.cvv }
                maxLength={ getCvvLength(cardType) }
                onChange={ ({ cardCvv } : CardCvvChangeEvent) => setCvv(cardCvv) }
                onValidityChange={ (cvvValidity : FieldValidity) => setCvvValidity(cvvValidity) }
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
    const [ numberValidity, setNumberValidity ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);

    const compousedStyles = { ...{ input: defaultInputStyle },  ...generalStyles };

    useEffect(() => {
        setNumberValidity(number);
        const valid = Boolean(number);
        const value = number;
        onChange({ value, valid });
    }, [ number ]);

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <CardNumber
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ numberValidity.isPossibleValid ? 'number valid' : 'number invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.number ?? defaultPlaceholders.number }
                maxLength='24'
                onChange={ ({ cardNumber } : CardNumberChangeEvent) => setNumber(cardNumber) }
                onValidityChange={ (validity : FieldValidity) => setNumberValidity(validity) }
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
    const [ expiryValid, setExpiryValidity ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);

    const compousedStyles = { ...{ input: defaultInputStyle },  ...generalStyles };

    useEffect(() => {
        setExpiryValidity(expiry);
        const valid = Boolean(expiry);
        onChange({ value: expiry, valid });
    }, [ expiry ]);

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <CardExpiry
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ expiryValid ? 'expiry valid' : 'expiry invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.expiry ?? defaultPlaceholders.expiry }
                maxLength='7'
                onChange={ ({ maskedDate } : CardExpiryChangeEvent) => setExpiry(maskedDate) }
                onValidityChange={ (expiryValidity : boolean) => setExpiryValidity(expiryValidity) }
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
    const [ cvvValid, setCvvValidity ] = useState(true);
    const [ generalStyles, inputStyles ] = getStyles(styleObject);
    
    const compousedStyles = { ...{ input: defaultInputStyle },  ...generalStyles };

    useEffect(() => {
        setCvvValidity(cvv);
        const valid = Boolean(cvv);
        onChange({ value: cvv, valid });
    }, [ cvv ]);

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {styleToString(compousedStyles)}
            </style>

            <CardCVV
                type='text'
                // eslint-disable-next-line react/forbid-component-props
                className={ cvvValid ? 'cvv valid' : 'cvv invalid' }
                // eslint-disable-next-line react/forbid-component-props
                style={ inputStyles }
                placeholder={ placeholder.cvv ?? defaultPlaceholders.cvv }
                maxLength='4'
                onChange={ ({ cardCvv } : CardCvvChangeEvent) => setCvv(cardCvv) }
                onValidityChange={ (cvvValidity : boolean) => setCvvValidity(cvvValidity) }
            />
        </Fragment>
    );
}
