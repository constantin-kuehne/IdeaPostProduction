import json
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Post_It, Session, User

class PostItConsumer(AsyncWebsocketConsumer):
    def save(self, res, post_it, cur_session):
        if len(res) > 0:
            res = res[0]
            res.content = post_it['content']
            res.color = post_it['color']
            res.height = post_it['height'] - 4
            res.width = post_it['width'] - 20
            res.top = post_it['top']
            res.left = post_it['left']
            res.zindex = post_it['zIndex']
            res.save()
        elif len(res) == 0:
            new = Post_It(
                htmlId=post_it['id'],
                content=post_it['content'],
                color=post_it['color'],
                height=post_it['height'] - 4,
                width=post_it['width'] - 20, 
                top=post_it['top'],
                left=post_it['left'],
                zindex=post_it['zIndex'],
                session_id=cur_session,
                author=User.objects.get(username=post_it['author'])
                )
            new.save()

    async def connect(self):
        self.session_code = self.scope['url_route']['kwargs']['session_code']
        self.room_group_name = 'chat_%s' % self.session_code
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, 
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        send_type = text_data_json['send_type']
        if send_type == 'save':
            data = text_data_json
            data['type'] = 'update'
            for post_it in data['content']:
                cur_session = await sync_to_async(Session.objects.get)(session_code=data['session_code'])
                res = await sync_to_async(Post_It.objects.filter)(htmlId=post_it['id'], session_id=cur_session)
                await sync_to_async(PostItConsumer.save)(self, res=res, post_it=post_it, cur_session=cur_session)
        elif send_type == 'create':
            data = text_data_json
            data['type'] = 'update'
            # save to database
        else:
            post_id = text_data_json['id']
            cookie = text_data_json['cookie']

            if text_data_json['send_type'] == 'write':
                content = text_data_json['content']
                data = {
                    'type': 'update',
                    'id': post_id,
                    'content': content,
                    'cookie': cookie,
                    'send_type': send_type
                }
            elif text_data_json['send_type'] == 'move':
                top = text_data_json['top']
                left = text_data_json['left']
                color = text_data_json['color']
                zIndex = text_data_json['zIndex']
                data = {
                    'type': 'update',
                    'id': post_id,
                    'top': top,
                    'left': left,
                    'color': color,
                    'zIndex': zIndex,
                    'cookie': cookie,
                    'send_type': send_type
                }
            elif text_data_json['send_type'] == 'resize':
                width = text_data_json['width']
                height = text_data_json['height']
                data = {
                    'type': 'update',
                    'id': post_id,
                    'cookie': cookie,
                    'width': width,
                    'height': height,
                    'send_type': send_type
                }
            elif text_data_json['send_type'] == 'delete':
                data = text_data_json
                data['type'] = 'update'
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, # self.room_group_name
            data
        )

    async def update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

