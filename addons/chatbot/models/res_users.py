# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class Users(models.Model):
    """ Update of res.users class
        - add a preference about username for chatbot purpose
    """
    _inherit = 'res.users'

    chatbot_username = fields.Char("Chatbot Username",
                                   help="This username will be used as your name in the chatbot channels.")

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + ['chatbot_username']

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + ['chatbot_username']
