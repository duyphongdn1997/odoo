/** @odoo-module **/

import FormController from 'web.FormController';

const ChatbotChannelFormController = FormController.extend({
    events: Object.assign({}, FormController.prototype.events, {
        'click .o_im_chatbot_channel_form_button_colors_reset_button': '_onClickChatbotButtonColorsResetButton',
        'click .o_im_chatbot_channel_form_chat_window_colors_reset_button': '_onClickChatbotChatWindowColorsResetButton',
    }),

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * @private
     * @param {Object} colorValues
     */
    async _updateColors(colorValues) {
        for (const name in colorValues) {
            this.$(`[name="${name}"] .o_field_color`).css('background-color', colorValues[name]);
        }
        const result = await this.model.notifyChanges(this.handle, colorValues);
        this._updateRendererState(this.model.get(this.handle), { fieldNames: result });
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * @private
     */
    async _onClickChatbotButtonColorsResetButton() {
        await this._updateColors({
            button_background_color: "#878787",
            button_text_color: "#FFFFFF",
        });
    },
    /**
     * @private
     */
    async _onClickchatbotChatWindowColorsResetButton() {
        await this._updateColors({
            header_background_color: "#875A7B",
            title_color: "#FFFFFF",
        });
    },
});

export default ChatbotChannelFormController;
