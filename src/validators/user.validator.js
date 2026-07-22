const {
    USER_ROLE_VALUES
} = require("../constants/user.constants");

const validateCreateUserInput = (input = {}) => {
    const values = {
        name: typeof input.name === "string"
            ? input.name.trim()
            : "",
        email: typeof input.email === "string"
            ? input.email.trim().toLowerCase()
            : "",
        password: typeof input.password === "string"
            ? input.password
            : "",
        role: typeof input.role === "string"
            ? input.role.trim()
            : "",
    };

    const errors = {};

    if (values.name.length < 3) {
        errors.name = "O nome deve possuir pelo menos 3 caracteres.";
    } else if (values.name.length > 100) {
        errors.name = "O nome deve possuir no máximo 100 caracteres.";
    }

    if (values.email.length === 0) {
        errors.email = "O email é obrigatório.";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
        errors.email = "O email é inválido.";
    }

    if (values.password.length < 8) {
        errors.password = "A senha deve possuir pelo menos 8 caracteres.";
    } else if (values.password.length > 120) {
        errors.password = "A senha deve possuir no máximo 120 caracteres.";
    }

    if (!USER_ROLE_VALUES.includes(values.role)) {
        errors.role = "Selecione um papel de usuário válido.";
    }

    return {
        values,
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};

module.exports = {
    validateCreateUserInput,
};