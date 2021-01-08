from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.home, name='Home'),
    path('signup/', views.sign_up, name='SignUp'),
    re_path(r'IdeaPost/(?P<session_code>\w+?)/$', views.ideapost, name='IdeaPost'),
    path('about/', views.about, name='About'),
    path('login/', views.login_page, name='Login'),
    path('sessions/', views.sessions, name='Sessions')
]
