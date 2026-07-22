const USER_ROLES = Object.freeze({
    USER: "USER",
    ADMIN: "ADMIN",
});

const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));

const USER_ROLE_LABELS = Object.freeze({
    [USER_ROLES.USER]: "Usuário Comum",
    [USER_ROLES.ADMIN]: "Administrador",
});

module.exports = {
    USER_ROLES,
    USER_ROLE_VALUES,
    USER_ROLE_LABELS,
};