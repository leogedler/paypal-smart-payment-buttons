/* @flow */
/** @jsx h */

import { h, render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import { getBody } from '../../lib';
import { setupExports, formatFieldValue, autoFocusOnFirstInput } from '../lib';
import { CARD_FIELD_TYPE_TO_FRAME_NAME, CARD_FIELD_TYPE } from '../constants';
import { submitCardFields } from '../interface';
import { getCardProps, type CardProps } from '../props';
import type { SetupCardOptions } from '../types';

import { CardField, CardNumberField, CardCVVField, CardExpiryField } from './fields';

type PageProps = {|
    cspNonce : string,
    props : CardProps
|};

function Page({ cspNonce, props } : PageProps) : mixed {
    const { facilitatorAccessToken, style, placeholder, type, onChange, export: xport } = props;

    const [ fieldValue, setFieldValue ] = useState();
    const [ fieldValid, setFieldValid ] = useState(false);
    const [ fieldErrors, setFieldErrors ] = useState([]);
    const [ mainRef, setRef ] = useState();

    const [ fieldGQLErrors, setFieldGQLErrors ] = useState({ singleField: {}, numberField: [], expiryField: [], cvvField: [] });

    const getFieldValue = () => {
        return fieldValue;
    };

    const isFieldValid = () => {
        return fieldValid;
    };

    const setGqlErrors = (errorData : {| field : string, errors : [] |}) => {
        const { errors } = errorData;

        const errorObject = { ...fieldGQLErrors };

        if (type === CARD_FIELD_TYPE.SINGLE) {
            errorObject.singleField = { ...errorData };
        }

        if (type === CARD_FIELD_TYPE.NUMBER) {
            errorObject.numberField = [ ...errors ];
        }

        if (type === CARD_FIELD_TYPE.EXPIRY) {
            errorObject.expiryField = [ ...errors ];
        }

        if (type === CARD_FIELD_TYPE.CVV) {
            errorObject.cvvField = [ ...errors ];
        }

        setFieldGQLErrors(errorObject);
    };

    const cleanGqlErrors = () => {
        setFieldGQLErrors({ singleField: {}, numberField: [], expiryField: [], cvvField: [] });
    };

    useEffect(() => {
        onChange({
            valid:  fieldValid,
            errors: fieldErrors
        });
    }, [ fieldValid, fieldErrors ]);

    useEffect(() => {
        autoFocusOnFirstInput(mainRef);
    }, [ mainRef ]);

    useEffect(() => {
        setupExports({
            name: CARD_FIELD_TYPE_TO_FRAME_NAME[type],
            isFieldValid,
            getFieldValue,
            setGqlErrors,
            cleanGqlErrors
        });

        xport({
            submit: () => {
                return submitCardFields({ facilitatorAccessToken });
            }
        });
    }, [ fieldValid, fieldValue ]);

    const onFieldChange = ({ value, valid, errors }) => {
        const newValue = formatFieldValue(value);
        
        setFieldValue(newValue);
        setFieldErrors([ ...errors ]);
        setFieldValid(valid);
        cleanGqlErrors();
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {`
                    * {
                        box-sizing: border-box;
                    }

                    html, body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                    }

                    body {
                        display: inline-block;
                        width: 100%;
                        font-size: 100%;
                        font-family: monospace;
                    }

                    *:focus {
                        outline: none;
                    }
                `}
            </style>

            {
                (type === CARD_FIELD_TYPE.SINGLE)
                    ? <CardField
                        gqlErrorsObject={ fieldGQLErrors.singleField }
                        cspNonce={ cspNonce }
                        onChange={ onFieldChange }
                        styleObject={ style }
                        placeholder={ placeholder }
                        autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.NUMBER)
                    ? <CardNumberField
                        ref={ mainRef }
                        gqlErrors={ fieldGQLErrors.numberField }
                        cspNonce={ cspNonce }
                        onChange={ onFieldChange }
                        styleObject={ style }
                        placeholder={ placeholder }
                        autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.CVV)
                    ? <CardCVVField
                        ref={ mainRef }
                        cspNonce={ cspNonce }
                        onChange={ onFieldChange }
                        styleObject={ style }
                        placeholder={ placeholder }
                        autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }

            {
                (type === CARD_FIELD_TYPE.EXPIRY)
                    ? <CardExpiryField
                        ref={ mainRef }
                        cspNonce={ cspNonce }
                        onChange={ onFieldChange }
                        styleObject={ style }
                        placeholder={ placeholder }
                        autoFocusRef={ (ref) => setRef(ref.current.base) }
                    /> : null
            }
        </Fragment>
    );
}

export function setupCard({ cspNonce, facilitatorAccessToken } : SetupCardOptions) {
    const props = getCardProps({
        facilitatorAccessToken
    });

    render(<Page cspNonce={ cspNonce } props={ props } />, getBody());
}
 
