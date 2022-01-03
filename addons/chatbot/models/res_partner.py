# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models


class Partners(models.Model):
    """ Update of res.partners class
        - override name_get to take into account the chatbot username
    """
    _inherit = 'res.partner'

    def name_get(self):
        if self.env.context.get('chatbot_use_username'):
            # process the ones with chatbot username
            users_with_chatbotname = self.env['res.users'].search([('partner_id', 'in', self.ids),
                                                                   ('chatbot_username', '!=', False)])
            map_with_chatbotname = {}
            for user in users_with_chatbotname:
                map_with_chatbotname[user.partner_id.id] = user.chatbot_username

            # process the ones without livecaht username
            partner_without_chatbotname = self - users_with_chatbotname.mapped('partner_id')
            no_chatbotname_name_get = super(Partners, partner_without_chatbotname).name_get()
            map_without_chatbotname = dict(no_chatbotname_name_get)

            # restore order
            result = []
            for partner in self:
                name = map_with_chatbotname.get(partner.id)
                if not name:
                    name = map_without_chatbotname.get(partner.id)
                result.append((partner.id, name))
        else:
            result = super(Partners, self).name_get()
        return result

    def _get_channels_as_member(self):
        channels = super()._get_channels_as_member()
        channels |= self.env['mail.channel'].search([
            ('channel_type', '=', 'chatbot'),
            ('channel_last_seen_partner_ids', 'in', self.env['mail.channel.partner'].sudo()._search([
                ('partner_id', '=', self.id),
                ('is_pinned', '=', True),
            ])),
        ])
        return channels
