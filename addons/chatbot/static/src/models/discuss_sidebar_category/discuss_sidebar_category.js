/** @odoo-module **/

import { registerFieldPatchModel, registerIdentifyingFieldsPatch } from '@mail/model/model_core';
import { one2one } from '@mail/model/model_field';

registerFieldPatchModel('mail.discuss_sidebar_category', 'chatbot', {
    discussAsChatbot: one2one('mail.discuss', {
        inverse: 'categoryChatbot',
        readonly: true,
    }),
});

registerIdentifyingFieldsPatch('mail.discuss_sidebar_category', 'chatbot', identifyingFields => {
    identifyingFields[0].push('discussAsChatbot');
});
