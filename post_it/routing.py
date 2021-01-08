from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/IdeaPost/(?P<session_code>\w+?)/$', consumers.PostItConsumer.as_asgi())
]
