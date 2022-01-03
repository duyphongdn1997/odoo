/** @odoo-module **/

import { registerInstancePatchModel } from '@mail/model/model_core';

registerInstancePatchModel('mail.chat_window', 'chatbot/static/src/models/chat_window/chat_window.js', {

    /**
     * @override
     */
    close({ notifyServer } = {}) {
        if (
            this.thread &&
            this.thread.model === 'mail.channel' &&
            this.thread.channel_type === 'chatbot' &&
            this.thread.cache.isLoaded &&
            this.thread.messages.length === 0
        ) {
            notifyServer = true;
            this.thread.unpin();
        }
        this._super({ notifyServer });
    }
});
