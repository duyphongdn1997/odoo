/** @odoo-module **/

import { registerClassPatchModel } from '@mail/model/model_core';

let nextPublicId = -1;

registerClassPatchModel('mail.partner', 'chatbot/static/src/models/partner/partner.js', {

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    getNextPublicId() {
        const id = nextPublicId;
        nextPublicId -= 1;
        return id;
    },
});

