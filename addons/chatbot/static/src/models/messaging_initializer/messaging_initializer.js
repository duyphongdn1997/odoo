/** @odoo-module **/

import { registerInstancePatchModel } from '@mail/model/model_core';
import { insert, insertAndReplace } from '@mail/model/model_field_command';

registerInstancePatchModel('mail.messaging_initializer', 'chatbot/static/src/models/messaging_initializer/messaging_initializer.js', {
    /**
     * @override
     * @param {Object} resUsersSettings
     * @param {boolean} resUsersSettings.is_discuss_sidebar_category_chatbot_open
     */
    _initResUsersSettings({ is_discuss_sidebar_category_chatbot_open }) {
        this.messaging.discuss.update({
            categoryChatbot: insertAndReplace({
                isServerOpen: is_discuss_sidebar_category_chatbot_open,
                name: this.env._t("Chatbot"),
                serverStateKey: 'is_discuss_sidebar_category_chatbot_open',
                sortComputeMethod: 'last_action',
                supportedChannelTypes: ['chatbot'],
            }),
        });
        this._super(...arguments);
    },

    /**
     * @override
     * @param {Object[]} [param0.channel_chatbot=[]]
     */
    _initCommands() {
        this._super();
        this.messaging.update({
            commands: insert({
                channel_types: ['chatbot'],
                help: this.env._t("See 15 last visited pages"),
                methodName: 'execute_command_history',
                name: "history",
            }),
        });
    },
});
