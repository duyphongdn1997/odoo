/** @odoo-module **/

import { MockModels } from '@mail/../tests/helpers/mock_models';
import { patch } from 'web.utils';

patch(MockModels, 'chatbot/static/tests/helpers/mock_models.js', {

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    /**
     * @override
     */
    generateData() {
        const data = this._super(...arguments);
        Object.assign(data, {
            'chatbot.channel': {
                fields: {
                    user_ids: { string: "Operators", type: 'many2many', relation: 'res.users' }
                },
                records: [],
            }
        });
        Object.assign(data['mail.channel'].fields, {
            anonymous_name: { string: "Anonymous Name", type: 'char' },
            country_id: { string: "Country", type: 'many2one', relation: 'res.country' },
            chatbot_active: { string: "Is chatbot ongoing?", type: 'boolean', default: false },
            chatbot_channel_id: { string: "Channel", type: 'many2one', relation: 'chatbot.channel' },
            chatbot_operator_id: { string: "Operator", type: 'many2one', relation: 'res.partner' },
        });
        Object.assign(data['res.users.settings'].fields, {
            is_discuss_sidebar_category_chatbot_open: { string: "Is Discuss Sidebar Category Chatbot Open?", type: 'boolean', default: true },
        });
        Object.assign(data['res.users'].fields, {
            chatbot_username: { string: 'Chatbot Username', type: 'string' },
        });
        return data;
    },

});
