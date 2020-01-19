export const inputType = {
    'email': 'email',
    'password': 'password',
    'login': 'login',
}

const isEmailValid = (email) => typeof email === 'string' &&
    new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/) // eslint-disable-line
        .test(email);

const isPasswordValid = (password) => typeof password === 'string' && password.length >= 6;

export const inputConfig = {
    [inputType.email]: {
        validator: isEmailValid,
        message: 'Please enter a valid email',
    },
    [inputType.password]: {
        validator: isPasswordValid,
        message: 'Your password should be at least 6 characters long',
    },
    [inputType.login]: {},
}