/** @odoo-module **/

import {
    afterEach,
    beforeEach,
    start,
} from '@mail/utils/test_utils';

QUnit.module('chatbot', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('discuss_sidebar_category_item', {}, function () {
QUnit.module('discuss_sidebar_category_item_tests.js', {
    beforeEach() {
        beforeEach(this);

        this.start = async params => {
            const { env, widget } = await start(Object.assign({}, params, {
                autoOpenDiscuss: true,
                data: this.data,
                hasDiscuss: true,
            }));
            this.env = env;
            this.widget = widget;
        };
    },
    afterEach() {
        afterEach(this);
    },
});

QUnit.test('chatbot - avatar: should have a smiley face avatar for an anonymous chatbot item', async function (assert) {
    assert.expect(2);

    this.data['mail.channel'].records.push({
        anonymous_name: "Visitor 11",
        channel_type: 'chatbot',
        id: 11,
        chatbot_operator_id: this.data.currentPartnerId,
        members: [this.data.currentPartnerId, this.data.currentPartnerId],
    });
    await this.start();

    const chatbotItem = document.querySelector(`
        .o_DiscussSidebarCategoryItem[data-thread-local-id="${
            this.messaging.models['mail.thread'].findFromIdentifyingData({
                id: 11,
                model: 'mail.channel',
            }).localId
        }"]
    `);
    assert.containsOnce(
        chatbotItem,
        `.o_DiscussSidebarCategoryItem_image`,
        "should have an avatar"
    );
    assert.strictEqual(
        chatbotItem.querySelector(`:scope .o_DiscussSidebarCategoryItem_image`).dataset.src,
        '/mail/static/src/img/smiley/avatar.jpg',
        'should have the smiley face as the avatar for anonymous users'
    );
});

QUnit.test('chatbot - avatar: should have a partner profile picture for a chatbot item linked with a partner', async function (assert) {
    assert.expect(2);

    this.data['res.partner'].records.push({
        id: 10,
        name: "Jean",
    });
    this.data['mail.channel'].records.push({
        channel_type: 'chatbot',
        id: 11,
        chatbot_operator_id: this.data.currentPartnerId,
        members: [this.data.currentPartnerId, 10],
    });
    await this.start();

    const chatbotItem = document.querySelector(`
        .o_DiscussSidebarCategoryItem[data-thread-local-id="${
            this.messaging.models['mail.thread'].findFromIdentifyingData({
                id: 11,
                model: 'mail.channel',
            }).localId
        }"]
    `);
    assert.containsOnce(
        chatbotItem,
        `.o_DiscussSidebarCategoryItem_image`,
        "should have an avatar"
    );
    assert.strictEqual(
        chatbotItem.querySelector(`:scope .o_DiscussSidebarCategoryItem_image`).dataset.src,
        '/web/image/res.partner/10/avatar_128',
        'should have the partner profile picture as the avatar for partners'
    );
});

});
});
});
