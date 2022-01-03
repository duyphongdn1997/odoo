/** @odoo-module **/

import {
    afterEach,
    afterNextRender,
    beforeEach,
    nextAnimationFrame,
    start,
} from '@mail/utils/test_utils';

import { datetime_to_str } from 'web.time';

QUnit.module('chatbot', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('discuss', {}, function () {
QUnit.module('discuss_tests.js', {
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

QUnit.test('chatbot in the sidebar: basic rendering', async function (assert) {
    assert.expect(5);

    this.data['mail.channel'].records.push({
        anonymous_name: "Visitor 11",
        channel_type: 'chatbot',
        id: 11,
        chatbot_operator_id: this.data.currentPartnerId,
        members: [this.data.currentPartnerId, this.data.publicPartnerId],
    });
    await this.start();
    assert.containsOnce(document.body, '.o_Discuss_sidebar',
        "should have a sidebar section"
    );
    const groupChatbot = document.querySelector('.o_DiscussSidebar_categoryChatbot');
    assert.ok(groupChatbot,
        "should have a channel group chatbot"
    );
    const titleText = groupChatbot.querySelector('.o_DiscussSidebarCategory_titleText');
    assert.strictEqual(
        titleText.textContent.trim(),
        "Chatbot",
        "should have a channel group named 'Chatbot'"
    );
    const chatbot = groupChatbot.querySelector(`
        .o_DiscussSidebarCategoryItem[data-thread-local-id="${
            this.messaging.models['mail.thread'].findFromIdentifyingData({
                id: 11,
                model: 'mail.channel',
            }).localId
        }"]
    `);
    assert.ok(
        chatbot,
        "should have a chatbot in sidebar"
    );
    assert.strictEqual(
        chatbot.textContent,
        "Visitor 11",
        "should have 'Visitor 11' as chatbot name"
    );
});

QUnit.test('chatbot in the sidebar: existing user with country', async function (assert) {
    assert.expect(3);

    this.data['res.country'].records.push({
        code: 'be',
        id: 10,
        name: "Belgium",
    });
    this.data['res.partner'].records.push({
        country_id: 10,
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
    assert.containsOnce(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should have a channel group chatbot in the side bar"
    );
    const chatbot = document.querySelector('.o_DiscussSidebar_categoryChatbot .o_DiscussSidebarCategoryItem');
    assert.ok(
        chatbot,
        "should have a chatbot in sidebar"
    );
    assert.strictEqual(
        chatbot.textContent,
        "Jean (Belgium)",
        "should have user name and country as chatbot name"
    );
});

QUnit.test('do not add chatbot in the sidebar on visitor opening his chat', async function (assert) {
    assert.expect(2);

    const currentUser = this.data['res.users'].records.find(user =>
        user.id === this.data.currentUserId
    );
    currentUser.im_status = 'online';
    this.data['chatbot.channel'].records.push({
        id: 10,
        user_ids: [this.data.currentUserId],
    });
    await this.start();
    assert.containsNone(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should not have any chatbot in the sidebar initially"
    );

    // simulate chatbot visitor opening his chat
    await this.env.services.rpc({
        route: '/chatbot/get_session',
        params: {
            context: {
                mockedUserId: false,
            },
            channel_id: 10,
        },
    });
    await nextAnimationFrame();
    assert.containsNone(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should still not have any chatbot in the sidebar after visitor opened his chat"
    );
});

QUnit.test('do not add chatbot in the sidebar on visitor typing', async function (assert) {
    assert.expect(2);

    const currentUser = this.data['res.users'].records.find(user =>
        user.id === this.data.currentUserId
    );
    currentUser.im_status = 'online';
    this.data['chatbot.channel'].records.push({
        id: 10,
        user_ids: [this.data.currentUserId],
    });
    this.data['mail.channel'].records.push({
        channel_type: 'chatbot',
        id: 10,
        is_pinned: false,
        chatbot_channel_id: 10,
        chatbot_operator_id: this.data.currentPartnerId,
        members: [this.data.publicPartnerId, this.data.currentPartnerId],
    });
    await this.start();
    assert.containsNone(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should not have any chatbot in the sidebar initially"
    );

    // simulate chatbot visitor typing
    const channel = this.data['mail.channel'].records.find(channel => channel.id === 10);
    await this.env.services.rpc({
        route: '/chatbot/notify_typing',
        params: {
            context: {
                mockedPartnerId: this.publicPartnerId,
            },
            is_typing: true,
            uuid: channel.uuid,
        },
    });
    await nextAnimationFrame();
    assert.containsNone(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should still not have any chatbot in the sidebar after visitor started typing"
    );
});

QUnit.test('add chatbot in the sidebar on visitor sending first message', async function (assert) {
    assert.expect(4);

    const currentUser = this.data['res.users'].records.find(user =>
        user.id === this.data.currentUserId
    );
    currentUser.im_status = 'online';
    this.data['res.country'].records.push({
        code: 'be',
        id: 10,
        name: "Belgium",
    });
    this.data['chatbot.channel'].records.push({
        id: 10,
        user_ids: [this.data.currentUserId],
    });
    this.data['mail.channel'].records.push({
        anonymous_name: "Visitor (Belgium)",
        channel_type: 'chatbot',
        country_id: 10,
        id: 10,
        is_pinned: false,
        chatbot_channel_id: 10,
        chatbot_operator_id: this.data.currentPartnerId,
        members: [this.data.publicPartnerId, this.data.currentPartnerId],
    });
    await this.start();
    assert.containsNone(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should not have any chatbot in the sidebar initially"
    );

    // simulate chatbot visitor sending a message
    const channel = this.data['mail.channel'].records.find(channel => channel.id === 10);
    await afterNextRender(async () => this.env.services.rpc({
        route: '/mail/chat_post',
        params: {
            context: {
                mockedUserId: false,
            },
            uuid: channel.uuid,
            message_content: "new message",
        },
    }));
    assert.containsOnce(
        document.body,
        '.o_DiscussSidebar_categoryChatbot',
        "should have a channel group chatbot in the side bar after receiving first message"
    );
    assert.containsOnce(
        document.body,
        '.o_DiscussSidebar_categoryChatbot .o_DiscussSidebarCategoryItem',
        "should have a chatbot in the sidebar after receiving first message"
    );
    assert.strictEqual(
        document.querySelector('.o_DiscussSidebar_categoryChatbot .o_DiscussSidebarCategoryItem .o_DiscussSidebarCategoryItem_name').textContent,
        "Visitor (Belgium)",
        "should have visitor name and country as chatbot name"
    );
});

QUnit.test('chatbots are sorted by last activity time in the sidebar: most recent at the top', async function (assert) {
    assert.expect(6);

    this.data['mail.channel'].records.push(
        {
            anonymous_name: "Visitor 11",
            channel_type: 'chatbot',
            id: 11,
            chatbot_operator_id: this.data.currentPartnerId,
            members: [this.data.currentPartnerId, this.data.publicPartnerId],
            last_interest_dt: datetime_to_str(new Date(2021, 0, 1)), // less recent one
        },
        {
            anonymous_name: "Visitor 12",
            channel_type: 'chatbot',
            id: 12,
            chatbot_operator_id: this.data.currentPartnerId,
            members: [this.data.currentPartnerId, this.data.publicPartnerId],
            last_interest_dt: datetime_to_str(new Date(2021, 0, 2)), // more recent one
        },
    );
    await this.start();
    const chatbot11 = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 11,
        model: 'mail.channel',
    });
    const chatbot12 = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 12,
        model: 'mail.channel',
    });
    const initialChatbots = document.querySelectorAll('.o_DiscussSidebar_categoryChatbot .o_DiscussSidebarCategoryItem');
    assert.strictEqual(
        initialChatbots.length,
        2,
        "should have 2 chatbot items"
    );
    assert.strictEqual(
        initialChatbots[0].dataset.threadLocalId,
        chatbot12.localId,
        "first chatbot should be the one with the more recent last activity time"
    );
    assert.strictEqual(
        initialChatbots[1].dataset.threadLocalId,
        chatbot11.localId,
        "second chatbot should be the one with the less recent last activity time"
    );

    // post a new message on the last channel
    await afterNextRender(() => initialChatbots[1].click());
    await afterNextRender(() => document.execCommand('insertText', false, "Blabla"));
    await afterNextRender(() => document.querySelector('.o_Composer_buttonSend').click());

    const newChatbots = document.querySelectorAll('.o_DiscussSidebar_categoryChatbot .o_DiscussSidebarCategoryItem');
    assert.strictEqual(
        newChatbots.length,
        2,
        "should have 2 Chatbot items"
    );
    assert.strictEqual(
        newChatbots[0].dataset.threadLocalId,
        chatbot11.localId,
        "first chatbot should be the one with the more recent last activity time"
    );
    assert.strictEqual(
        newChatbots[1].dataset.threadLocalId,
        chatbot12.localId,
        "second chatbot should be the one with the less recent last activity time"
    );
});

QUnit.test('invite button should be present on chatbot', async function (assert) {
    assert.expect(1);

    this.data['mail.channel'].records.push(
        {
            anonymous_name: "Visitor 11",
            channel_type: 'chatbot',
            id: 11,
            chatbot_operator_id: this.data.currentPartnerId,
            members: [this.data.currentPartnerId, this.data.publicPartnerId],
        },
    );
    await this.start({
        discuss: {
            params: {
                default_active_id: 'mail.channel_11',
            },
        },
    });
    assert.containsOnce(
        document.body,
        '.o_ThreadViewTopbar_inviteButton',
        "Invite button should be visible in top bar when chatbot is active thread"
    );
});

});
});
});
