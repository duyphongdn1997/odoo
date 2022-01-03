/** @odoo-module **/

import ChatbotChannelFormController from '@chatbot/js/chatbot_channel_form_controller';

import FormView from 'web.FormView';
import viewRegistry from 'web.view_registry';

const ChatbotChannelFormView = FormView.extend({
    config: Object.assign({}, FormView.prototype.config, {
        Controller: ChatbotChannelFormController,
    }),
});

viewRegistry.add('im_chatbot_channel_form_view_js', ChatbotChannelFormView);

export default ChatbotChannelFormView;
