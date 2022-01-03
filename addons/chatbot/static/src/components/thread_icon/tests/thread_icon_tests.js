/** @odoo-module **/

import {
    afterEach,
    afterNextRender,
    beforeEach,
    createRootMessagingComponent,
    start,
} from '@mail/utils/test_utils';

QUnit.module('chatbot', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('thread_icon', {}, function () {
QUnit.module('thread_icon_tests.js', {
    beforeEach() {
        beforeEach(this);

        this.createThreadIcon = async thread => {
            await createRootMessagingComponent(this, "ThreadIcon", {
                props: { threadLocalId: thread.localId },
                target: this.widget.el,
            });
        };

        this.start = async params => {
            const { env, widget } = await start(Object.assign({}, params, {
                data: this.data,
            }));
            this.env = env;
            this.widget = widget;
        };
    },
    afterEach() {
        afterEach(this);
    },
});

QUnit.test('chatbot: public website visitor is typing', async function (assert) {
    assert.expect(4);

    this.data['mail.channel'].records.push({
        anonymous_name: "Visitor 20",
        channel_type: 'chatbot',
        id: 20,
        chatbot_operator_id: this.data.currentPartnerId,
        members: [this.data.currentPartnerId, this.data.publicPartnerId],
    });
    await this.start();
    const thread = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 20,
        model: 'mail.channel',
    });
    await this.createThreadIcon(thread);
    assert.containsOnce(
        document.body,
        '.o_ThreadIcon',
        "should have thread icon"
    );
    assert.containsOnce(
        document.body,
        '.o_ThreadIcon .fa.fa-comments',
        "should have default chatbot icon"
    );

    // simulate receive typing notification from chatbot visitor "is typing"
    await afterNextRender(() => {
        this.widget.call('bus_service', 'trigger', 'notification', [{
            type: 'mail.channel.partner/typing_status',
            payload: {
                channel_id: 20,
                is_typing: true,
                partner_id: this.messaging.publicPartners[0].id,
                partner_name: this.messaging.publicPartners[0].name,
            },
        }]);
    });
    assert.containsOnce(
        document.body,
        '.o_ThreadIcon_typing',
        "should have thread icon with visitor currently typing"
    );
    assert.strictEqual(
        document.querySelector('.o_ThreadIcon_typing').title,
        "Visitor 20 is typing...",
        "title of icon should tell visitor is currently typing"
    );
});

});
});
});
