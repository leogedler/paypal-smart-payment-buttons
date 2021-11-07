/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { INTENT } from '@paypal/sdk-constants';
import { getAllFramesInWindow, isSameDomain } from 'cross-domain-utils/src';
import { uniqueID } from 'belter/src';

import { FRAME_NAME } from '../constants';
import { tokenizeCard, approveCardPayment } from '../api';
import { getLogger } from '../lib';

import { getCardProps } from './props';
import type { Card } from './types';
import { type CardExports, type ExportsOptions, parseGQLErrors } from './lib';

function getExportsByFrameName<T>(name : $Values<typeof FRAME_NAME>) : ?CardExports<T> {
    try {
        for (const win of getAllFramesInWindow(window)) {

            if (
                isSameDomain(win) &&
                // $FlowFixMe
                win.exports &&
                win.exports.name === name
            ) {
                return win.exports;
            }
        }
    } catch (err) {
        // pass
    }
}


function getCardFrames() : {| cardFrame : ?ExportsOptions,  cardNumberFrame : ?ExportsOptions, cardCVVFrame : ?ExportsOptions, cardExpiryFrame : ?ExportsOptions |} {

    const cardFrame = getExportsByFrameName(FRAME_NAME.CARD_FIELD);
    const cardNumberFrame = getExportsByFrameName(FRAME_NAME.CARD_NUMBER_FIELD);
    const cardCVVFrame = getExportsByFrameName(FRAME_NAME.CARD_CVV_FIELD);
    const cardExpiryFrame = getExportsByFrameName(FRAME_NAME.CARD_EXPIRY_FIELD);

    return {
        cardFrame,
        cardNumberFrame,
        cardCVVFrame,
        cardExpiryFrame
    };
}


export function hasCardFields() : boolean {
    const { cardFrame } = getCardFrames();

    if (cardFrame) {
        return true;
    }

    const { cardNumberFrame, cardCVVFrame, cardExpiryFrame } = getCardFrames();

    if (cardNumberFrame && cardCVVFrame && cardExpiryFrame) {
        return true;
    }

    return false;
}

export function getCardFields() : ?Card {
    const cardFrame = getExportsByFrameName(FRAME_NAME.CARD_FIELD);

    if (cardFrame && cardFrame.isFieldValid()) {
        return cardFrame.getFieldValue();
    }

    const { cardNumberFrame, cardCVVFrame, cardExpiryFrame } = getCardFrames();

    if (
        cardNumberFrame && cardNumberFrame.isFieldValid() &&
        cardCVVFrame && cardCVVFrame.isFieldValid() &&
        cardExpiryFrame && cardExpiryFrame.isFieldValid()
    ) {
        return {
            number: cardNumberFrame.getFieldValue(),
            cvv:    cardCVVFrame.getFieldValue(),
            expiry: cardExpiryFrame.getFieldValue()
        };
    }

    throw new Error(`Card fields not available to submit`);
}

export function emitGqlErrors(mapErrors : Object) : void {
    const { cardFrame, cardNumberFrame, cardExpiryFrame, cardCVVFrame } = getCardFrames();

    const { number, expiry, security_code } = mapErrors;

    if (cardFrame) {
        let cardFieldError = { field: '', errors: [] };
        if (number) {
            cardFieldError = { field: 'number', errors: number };
        }

        if (expiry) {
            cardFieldError = { field: 'expiry', errors: expiry };
        }

        if (security_code) {
            cardFieldError = { field: 'cvv', errors: security_code };
        }

        cardFrame.setGqlErrors(cardFieldError);
    }

    if (cardNumberFrame) {
        cardNumberFrame.setGqlErrors({ field: 'number', errors: number });
    }

    if (cardExpiryFrame) {
        cardExpiryFrame.setGqlErrors({ field: 'expiry', errors: expiry });
    }

    if (cardCVVFrame) {
        cardCVVFrame.setGqlErrors({ field: 'cvv', errors: security_code });
    }
}

export function cleanGqlErrors() : void {
    const { cardFrame, cardNumberFrame, cardExpiryFrame, cardCVVFrame } = getCardFrames();

    if (cardFrame) {
        cardFrame.cleanGqlErrors();
    }

    if (cardNumberFrame) {
        cardNumberFrame.cleanGqlErrors();
    }

    if (cardExpiryFrame) {
        cardExpiryFrame.cleanGqlErrors();
    }

    if (cardCVVFrame) {
        cardCVVFrame.cleanGqlErrors();
    }
}

type SubmitCardFieldsOptions = {|
    facilitatorAccessToken : string
|};

export function submitCardFields({ facilitatorAccessToken } : SubmitCardFieldsOptions) : ZalgoPromise<void> {
    const { intent, branded, vault, createOrder, onApprove, clientID } = getCardProps({ facilitatorAccessToken });

    cleanGqlErrors();

    return ZalgoPromise.try(() => {
        if (!hasCardFields()) {
            throw new Error(`Card fields not available to submit`);
        }

        const card = getCardFields();

        if (!card) {
            return;
        }

        const restart = () => {
            throw new Error(`Restart not implemented for card fields flow`);
        };
    
        if (intent === INTENT.TOKENIZE) {
            return tokenizeCard({ card }).then(({ paymentMethodToken }) => {
                return onApprove({ paymentMethodToken }, { restart });
            });
        }

        if (intent === INTENT.CAPTURE || intent === INTENT.AUTHORIZE) {
            return createOrder().then(orderID => {

                const cardObject = {
                    cardNumber:     card.number,
                    expirationDate: card.expiry,
                    securityCode:   card.cvv
                };

                return approveCardPayment({ card: cardObject, orderID, vault, branded, clientID }).catch((error) => {

                    const { mapErrors, parsedErrors, errors } = parseGQLErrors(error);

                    if (mapErrors) {
                        emitGqlErrors(mapErrors);
                    }

                    getLogger().info('card_fields_payment_failed');

                    const errorObject = { parsedErrors, errors };

                    throw errorObject;
                });
            }).then(() => {
                return onApprove({ payerID: uniqueID(), buyerAccessToken: uniqueID() }, { restart });
            });
        }
    });
}
