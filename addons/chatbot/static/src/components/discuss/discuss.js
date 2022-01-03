/** @odoo-module **/

import { Discuss } from '@mail/components/discuss/discuss';

import { patch } from 'web.utils';

const components = { Discuss };

patch(components.Discuss.prototype, 'chatbot/static/src/components/discuss/discuss.js', {

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * @override
     */
    mobileNavbarTabs(...args) {
        return [...this._super(...args), {
            icon: 'fa fa-comments',
            id: 'chatbot',
            label: this.env._t("chatbot"),
        }];
    }

});
