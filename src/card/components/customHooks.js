/* @flow */

import { useState, useEffect } from 'preact/hooks';

type InputState = {|
    inputValue : string,
    maskedInputValue : string,
    cursorStart : number,
    cursorEnd : number,
    keyStrokeCount : number,
    isPossibleValid : boolean,
    isValid : boolean
|};

type InputOptions = {|
    inputState : InputState,
    validationFn : () => mixed
|};

const initState : InputState = {
    inputValue:       '',
    maskedInputValue: '',
    cursorStart:      0,
    cursorEnd:        0,
    keyStrokeCount:   0,
    isPossibleValid:  true,
    isValid:          false
};

export function useInputState({ state = initState, validationFn } : InputOptions) : [ InputState, (InputState) => void ] {
    const [ inputState, setInputState ] = useState(state);
    const [ isInputValid, setInputValidity ] = useState({ isValid: false, isPossibleValid: true });

    const { inputValue, maskedInputValue } = inputState;
    const { isPossibleValid, isValid  } = isInputValid;

    useEffect(() => {
        setInputValidity(validationFn());
    }, [ inputValue, maskedInputValue ]);

    return [ { ...inputState, isPossibleValid, isValid }, setInputState  ];
}
