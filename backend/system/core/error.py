from rest_framework import renderers
import json

class AccountErrorRenderer(renderers.JSONRenderer):
    charset = 'utf-8'
   
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if renderer_context:
            response = renderer_context.get('response')
            if response and response.status_code >= 400:
                return json.dumps({'errors': data})
        
        # Success response
        return json.dumps(data)