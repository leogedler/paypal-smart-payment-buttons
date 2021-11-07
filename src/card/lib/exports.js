/* @flow */

import { FRAME_NAME } from '../../constants';

export type ExportsOptions = {|
    name : $Values<typeof FRAME_NAME>,
    isFieldValid : () => boolean,
    // eslint-disable-next-line no-undef
    getFieldValue : <T>() => T,
    setGqlErrors : ({| field : string, errors : [] |}) => void,
    cleanGqlErrors : () => void
|};

export type CardExports<V> = {|
    name : $Values<typeof FRAME_NAME>,
    isFieldValid : () => boolean,
    getFieldValue : () => V,
    setGqlErrors : ({| field : string, errors : [] |}) => void,
    cleanGqlErrors : () => void
|};

export function setupExports<T>({ name, isFieldValid, getFieldValue, setGqlErrors, cleanGqlErrors } : ExportsOptions) {
    const xports : CardExports<T> = {
        name,
        isFieldValid,
        getFieldValue,
        setGqlErrors,
        cleanGqlErrors
    };

    window.exports = xports;
}
