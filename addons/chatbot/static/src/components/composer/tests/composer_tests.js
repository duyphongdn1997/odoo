/** @odoo-module **/

import { afterEach, beforeEach, start } from '@mail/utils/test_utils';

QUnit.module('chatbot', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('composer', {}, function () {
QUnit.module('composer_tests.js', {
    beforeEach() {
        beforeEach(this);

        this.start = async params => {
            const res = await start({ ...params, data: this.data });
            const { env, widget } = res;
            this.env = env;
            this.widget = widget;
            return res;
        };
    },
    afterEach() {
        afterEach(this);
    },
});

QUnit.test('chatbot: no add attachment button', async function (assert) {
    // Attachments are not yet supported in chatbot, especially from chatbot
    // visitor PoV. This may likely change in the future with task-2029065.
    assert.expect(2);

    const { createComposerComponent } = await this.start();
    const thread = this.messaging.models['mail.thread'].create({
        channel_type: 'chatbot',
        id: 10,
        model: 'mail.channel',
    });
    await createComposerComponent(thread.composer);
    assert.containsOnce(document.body, '.o_Composer', "should have a composer");
    assert.containsNone(
        document.body,
        '.o_Composer_buttonAttachment',
        "composer linked to chatbot should not have a 'Add attachment' button"
    );
});

});
});
});
