from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import post_it.routing
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            post_it.routing.websocket_urlpatterns
        )
    ),
})