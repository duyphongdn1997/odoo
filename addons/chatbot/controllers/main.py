# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import base64

from odoo import http, tools
from odoo.http import request
from odoo.addons.base.models.assetsbundle import AssetsBundle


class ChatbotController(http.Controller):

    # Note: the `cors` attribute on many routes is meant to allow the chatbot
    # to be embedded in an external website.

    @http.route('/chatbot/external_lib.<any(css,js):ext>', type='http', auth='public')
    def chatbot_lib(self, ext):
        # _get_asset return the bundle html code (script and link list) but we want to use the attachment content
        bundle = 'chatbot.external_lib'
        files, _ = request.env["ir.qweb"]._get_asset_content(bundle)
        asset = AssetsBundle(bundle, files)

        mock_attachment = getattr(asset, ext)()
        if isinstance(mock_attachment, list):  # suppose that CSS asset will not required to be split in pages
            mock_attachment = mock_attachment[0]
        # can't use /web/content directly because we don't have attachment ids (attachments must be created)
        status, headers, content = request.env['ir.http'].binary_content(id=mock_attachment.id, unique=asset.checksum)
        content_base64 = base64.b64decode(content) if content else ''
        headers.append(('Content-Length', len(content_base64)))
        return request.make_response(content_base64, headers)

    @http.route('/chatbot/load_templates', type='json', auth='none', cors="*")
    def load_templates(self):
        templates = [
            'chatbot/static/src/legacy/public_chatbot.xml',
        ]
        return [tools.file_open(tmpl, 'rb').read() for tmpl in templates]

    @http.route('/chatbot/support/<int:channel_id>', type='http', auth='public')
    def support_page(self, channel_id):
        channel = request.env['chatbot.channel'].sudo().browse(channel_id)
        return request.render('chatbot.support_page', {'channel': channel})

    @http.route('/chatbot/loader/<int:channel_id>', type='http', auth='public')
    def loader(self, channel_id, **kwargs):
        username = kwargs.get("username", "Visitor")
        channel = request.env['chatbot.channel'].sudo().browse(channel_id)
        info = channel.get_chatbot_info(username=username)
        return request.render('chatbot.loader', {'info': info, 'web_session_required': True},
                              headers=[('Content-Type', 'application/javascript')])

    @http.route('/chatbot/init', type='json', auth="public", cors="*")
    def chatbot_init(self, channel_id):
        available = len(request.env['chatbot.channel'].sudo().browse(channel_id)._get_available_users())
        rule = {}
        if available:
            # find the country from the request
            country_id = False
            country_code = request.session.geoip.get('country_code') if request.session.geoip else False
            if country_code:
                country_id = request.env['res.country'].sudo().search([('code', '=', country_code)], limit=1).id
            # extract url
            url = request.httprequest.headers.get('Referer')
            # find the first matching rule for the given country and url
            matching_rule = request.env['chatbot.channel.rule'].sudo().match_rule(channel_id, url, country_id)
            if matching_rule:
                rule = {
                    'action': matching_rule.action,
                    'auto_popup_timer': matching_rule.auto_popup_timer,
                    'regex_url': matching_rule.regex_url,
                }
        return {
            'available_for_me': available and (not rule or rule['action'] != 'hide_button'),
            'rule': rule,
        }

    @http.route('/chatbot/get_session', type="json", auth='public', cors="*")
    def get_session(self, channel_id, anonymous_name, previous_operator_id=None):
        user_id = None
        country_id = None
        # if the user is identifiy (eg: portal user on the frontend),
        # don't use the anonymous name. The user will be added to session.
        if request.session.uid:
            user_id = request.env.user.id
            country_id = request.env.user.country_id.id
        else:
            # if geoip, add the country name to the anonymous name
            if request.session.geoip:
                # get the country of the anonymous person, if any
                country_code = request.session.geoip.get('country_code', "")
                country = request.env['res.country'].sudo().search([('code', '=', country_code)],
                                                                   limit=1) if country_code else None
                if country:
                    anonymous_name = "%s (%s)" % (anonymous_name, country.name)
                    country_id = country.id

        if previous_operator_id:
            previous_operator_id = int(previous_operator_id)

        return request.env["chatbot.channel"].with_context(lang=False).sudo().browse(
            channel_id)._open_chatbot_mail_channel(anonymous_name, previous_operator_id, user_id, country_id)

    @http.route('/chatbot/history', type="json", auth="public", cors="*")
    def history_pages(self, pid, channel_uuid, page_history=None):
        partner_ids = (pid, request.env.user.partner_id.id)
        channel = request.env['mail.channel'].sudo().search(
            [('uuid', '=', channel_uuid), ('channel_partner_ids', 'in', partner_ids)])
        if channel:
            channel._send_history_message(pid, page_history)
        return True

    @http.route('/chatbot/notify_typing', type='json', auth='public', cors="*")
    def notify_typing(self, uuid, is_typing):
        """ Broadcast the typing notification of the website user to other channel members
            :param uuid: (string) the UUID of the chatbot channel
            :param is_typing: (boolean) tells whether the website user is typing or not.
        """
        channel = request.env['mail.channel'].sudo().search([('uuid', '=', uuid)], limit=1)
        channel.notify_typing(is_typing=is_typing)

    @http.route('/chatbot/email_chatbot_transcript', type='json', auth='public', cors="*")
    def email_chatbot_transcript(self, uuid, email):
        channel = request.env['mail.channel'].sudo().search([
            ('channel_type', '=', 'chatbot'),
            ('uuid', '=', uuid)], limit=1)
        if channel:
            channel._email_chatbot_transcript(email)

    @http.route('/chatbot/visitor_leave_session', type='json', auth="public")
    def visitor_leave_session(self, uuid):
        """ Called when the chatbot visitor leaves the conversation.
         This will clean the chat request and warn the operator that the conversation is over.
         This allows also to re-send a new chat request to the visitor, as while the visitor is
         in conversation with an operator, it's not possible to send the visitor a chat request."""
        mail_channel = request.env['mail.channel'].sudo().search([('uuid', '=', uuid)])
        if mail_channel:
            mail_channel._close_chatbot_session()

    @http.route('/chatbot/<int:channel_id>', type='http', auth='public')
    def support_page(self, channel_id, **kwargs):
        user_id = None
        country_id = None
        if request.session.uid:
            user_id = request.env.user.id
            country_id = request.env.user.country_id.id
        channel_info = request.env["chatbot.channel"].with_context(lang=False).sudo().browse(
            channel_id)._open_chatbot_mail_channel("", None, user_id, country_id)
        if not channel_info:
            sender_id = "Visitor"
            title_box = "Javisbe - Visitor"
        else:
            sender_id = channel_info["members"][0]["name"]
            title_box = channel_info["name"]
        return request.render('chatbot.support_page', {"sender_id": sender_id, "channel": channel_id,
                                                       "title": title_box})
