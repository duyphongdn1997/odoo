/** @odoo-module **/

import { NotificationList } from '@mail/components/notification_list/notification_list';
import { patch } from 'web.utils';

const components = { NotificationList };

components.NotificationList._allowedFilters.push('chatbot');

patch(components.NotificationList.prototype, 'chatbot/static/src/components/notification_list/notification_list.js', {

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Override to include chatbot channels.
     *
     * @override
     */
    _getThreads(props) {
        if (props.filter === 'chatbot') {
            return this.messaging.models['mail.thread'].all(thread =>
                thread.channel_type === 'chatbot' &&
                thread.isPinned &&
                thread.model === 'mail.channel'
            );
        }
        return this._super(...arguments);
    },

});
