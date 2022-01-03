/** @odoo-module **/

import { registerFieldPatchModel, registerInstancePatchModel } from '@mail/model/model_core';
import { one2one } from '@mail/model/model_field';

registerInstancePatchModel('mail.discuss', 'chatbot/static/src/models/discuss/discuss.js', {

    /**
     * @override
     */
    onInputQuickSearch(value) {
        if (!this.sidebarQuickSearchValue) {
            this.categoryChatbot.open();
        }
        return this._super(value);
    },
});

registerFieldPatchModel('mail.discuss', 'chatbot/static/src/models/discuss/discuss.js', {
    /**
     * Discuss sidebar category for `chatbot` channel threads.
     */
    categoryChatbot: one2one('mail.discuss_sidebar_category', {
        inverse: 'discussAsChatbot',
        isCausal: true,
    }),
});
