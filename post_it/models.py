from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import random
import string

def generate_code():
    length = 8
    while True:
        choices = string.ascii_letters + string.digits
        code = ''.join(random.choices(choices, k=length))
        if Session.objects.filter(session_code=code).count() == 0:
            break
    return code

class Session(models.Model):
    running = models.BooleanField(default=False)
    created_on = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=20, null=False)
    session_code = models.CharField(max_length=10, default=generate_code, unique=True)

class User_Session(models.Model):
    session_id = models.ForeignKey(Session, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

class Post_It(models.Model):
    htmlId = models.IntegerField(unique=False, null=False)
    content = models.TextField()
    color = models.CharField(max_length=100)
    height = models.FloatField()
    width = models.FloatField()
    top = models.FloatField()
    left = models.FloatField()
    zindex = models.IntegerField()
    last_changed = models.DateField(auto_now=True)
    created_on = models.DateField(default=timezone.now)
    session_id = models.ForeignKey(Session, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
