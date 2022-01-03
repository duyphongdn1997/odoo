# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import odoo
from odoo.tests import HttpCase

@odoo.tests.tagged('-at_install', 'post_install')
class TestChatbotSupportPage(HttpCase):
    def test_load_modules(self):
        """Checks that all javascript modules load correctly on the chatbot support page"""
        check_js_modules = """
            const { missing, failed, unloaded } = odoo.__DEBUG__.jsModules;
            if ([missing, failed, unloaded].some(arr => arr.length)) {
                console.error("Couldn't load all JS modules.", JSON.stringify({ missing, failed, unloaded }));
            } else {
                console.log("test successful");
            }
        """
        self.browser_js("/chatbot/support/1", code=check_js_modules, ready="odoo.__DEBUG__.didLogInfo")
