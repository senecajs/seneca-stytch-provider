"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const messages = {
    get_info: {
        desc: 'Get information about the Stytch SDK.',
    },
    load_user: {
        desc: 'Load Stytch data into an entity',
    },
    save_user: {
        desc: 'Update/Save Stytch data into an entity',
    },
    list_user: {
        desc: 'List Stytch data into an entity',
    },
    remove_user: {
        desc: 'Remove Stytch data from an entity',
    }
};
const sections = {};
exports.default = {
    messages,
    sections
};
if ('undefined' !== typeof (module)) {
    module.exports = {
        messages,
        sections
    };
}
//# sourceMappingURL=StytchProvider-doc.js.map