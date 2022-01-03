/** @odoo-module **/

import { ThreadPreview } from '@mail/components/thread_preview/thread_preview';

import { patch } from 'web.utils';

const components = { ThreadPreview };

patch(components.ThreadPreview.prototype, 'chatbot/static/src/components/thread_preview/thread_preview.js', {

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * @override
     */
    image(...args) {
        if (this.thread.channel_type === 'chatbot') {
            return '/mail/static/src/img/smiley/avatar.jpg';
        }
        return this._super(...args);
    }

});
