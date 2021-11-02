/* @flow */

import { getActiveElement } from '../../lib/dom';

import { autoFocusOnFirstInput, maskValidCard, formatDate } from './card-utils';

jest.mock('../../lib/dom');

function triggerFocusListener() {
    const cb = window.addEventListener.mock.calls.find((args) => {
        return args[0] === 'focus';
    })[1];

    cb();

    jest.runAllTimers();
}

describe('card utils', () => {
    describe('autoFocusOnFirstInput', () => {
        let input : HTMLInputElement;

        beforeEach(() => {
            jest.useFakeTimers();
            jest.spyOn(window, 'addEventListener').mockImplementation(jest.fn());
            input = document.createElement('input');

            (getActiveElement : JestMockFn<[], null | HTMLElement>).mockReturnValue(null);
        });

        it('noops when no input is passed', () => {
            autoFocusOnFirstInput();

            expect(window.addEventListener).not.toBeCalled();
        });

        it('adds a focus listener when input is available', () => {
            autoFocusOnFirstInput(input);

            expect(window.addEventListener).toBeCalledTimes(1);
        });

        it('noops when the active element is not the body or the document element', () => {
            const spy = jest.spyOn(input, 'focus');

            autoFocusOnFirstInput(input);

            triggerFocusListener();

            expect(spy).not.toBeCalled();
        });

        it('focuses on input when the document body is the active element', () => {
            const spy = jest.spyOn(input, 'focus');

            (getActiveElement : JestMockFn<[], null | HTMLElement>).mockReturnValue(document.body);

            autoFocusOnFirstInput(input);

            triggerFocusListener();

            expect(spy).toBeCalledTimes(1);
        });

        it('focuses on input when the document element is the active element', () => {
            const spy = jest.spyOn(input, 'focus');

            (getActiveElement : JestMockFn<[], null | HTMLElement>).mockReturnValue(document.documentElement);

            autoFocusOnFirstInput(input);

            triggerFocusListener();

            expect(spy).toBeCalledTimes(1);
        });

        it('applies a focus patch for Safari using setSelectionRange', () => {
            (getActiveElement : JestMockFn<[], null | HTMLElement>).mockReturnValue(document.body);

            input.value = 'foo';

            input.setSelectionRange(1, 2);

            const spy = jest.spyOn(input, 'setSelectionRange');
            autoFocusOnFirstInput(input);

            triggerFocusListener();

            expect(spy).toBeCalledTimes(2);
            expect(spy).toBeCalledWith(0, 0);
            expect(spy).toBeCalledWith(1, 2);
        });

        it('adjusts and resets the inputs value when it is empty to accomodate Safari quirk', () => {
            (getActiveElement : JestMockFn<[], null | HTMLElement>).mockReturnValue(document.body);

            input.value = '';

            const spy = jest.spyOn(input, 'value', 'set');
            autoFocusOnFirstInput(input);

            triggerFocusListener();

            expect(spy).toBeCalledTimes(2);
            expect(spy).toBeCalledWith(' ');
            expect(spy).toBeCalledWith('');
        });
    });

    describe('maskValidCard', () => {
        it('masks all but the last 4 of the card number with •', () => {
            const masked = maskValidCard('12345678901234');

            expect(masked).toBe('••••••••••1234');
        });

        it('retains white space', () => {
            const masked = maskValidCard('1234 5678 901234');

            expect(masked).toBe('•••• •••• ••1234');
        });

        it('does not mask when card number is less than 5 digits', () => {
            expect(maskValidCard('1234')).toBe('1234');
            expect(maskValidCard('123')).toBe('123');
            expect(maskValidCard('12')).toBe('12');
            expect(maskValidCard('1')).toBe('1');
            expect(maskValidCard('')).toBe('');
        });
    });

    describe('formatDate', () => {
        it('format valid number sequence', () => {
            const masked = formatDate('1022');

            expect(masked).toBe('10 / 22');
        });

        it('add slash at the end of a valid month', () => {
            const masked = formatDate('10');

            expect(masked).toBe('10 / ');
        });

        it('format number adding slash to separate month section from year section', () => {
            const masked = formatDate('22');

            expect(masked).toBe('02 / 2');
        });

        it('returns prevMask if it is possible valid', () => {
            const masked = formatDate('22');

            expect(masked).toBe('02 / 2');
        });

        it('returns only the month section when the string finished with slash', () => {
            const masked = formatDate('12 /');

            expect(masked).toBe('12');
        });

    });
});

