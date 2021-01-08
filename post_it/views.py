import re
from validate_email import validate_email

from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from .models import Post_It, Session, User_Session, User
from .forms import CreateUserForm

from django.contrib import messages



def sign_up(request):
    form = CreateUserForm()

    if request.method == "POST":
        form = CreateUserForm(request.POST)
        print(form.errors.items())
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password1")
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("Sessions")

    context = {
        'form': form
    }
    return render(request, 'post_it/signup.html', context) 


def login_page(request):
    if request.method == "POST":
        email_username = request.POST.get('login_email_username')
        password = request.POST.get('login_password')
        user = authenticate(request, username=email_username, password=password)
        if user is not None:
            login(request, user)
            return redirect(reverse(sessions))

    return render(request, 'post_it/login.html')

@login_required(login_url="/login")
def ideapost(request, session_code):
    check = Session.objects.get(session_code=session_code).user_session_set.filter(user_id=request.user)
    if len(check) == 0:
        return redirect("Sessions")
    if request.method == "POST":
        logout_button = request.POST.get("logout")
        if logout_button is not None:
            logout(request)
            return redirect("Login")
    context = {
        'post_its': Session.objects.get(session_code=session_code).post_it_set.all(),
        'session': session_code
    }
    return render(request, 'post_it/post_it_copy.html', context)

def about(request):
    return render(request, 'post_it/about.html')

@login_required(login_url="/login")
def home(request):
    return redirect(reverse(sessions))

@login_required(login_url="/login")
def sessions(request):
    res = User.objects.get(id=request.user.id).user_session_set.all()
    if request.method == "POST":
        print(request.POST)
        choice = request.POST.get("sessionChoice")
        add_user = request.POST.get("userToAdd")
        add_user_session = request.POST.get("sessionCode")
        new_session_name = request.POST.get("newSessionName")
        logout_button = request.POST.get("logout")
        print(logout_button)
        if logout_button is not None:
            logout(request)
            return redirect("Login")
        elif choice is not None:
            session_code = Session.objects.get(id=choice).session_code
            return redirect('IdeaPost', session_code=session_code)
        elif add_user is not None:
            add_user = add_user.strip()
            if len(add_user) > 0:
                user_exist = User.objects.filter(username=add_user)
                if len(user_exist) == 1:
                    user_session = Session.objects.get(session_code=add_user_session)
                    user_already_in_session = user_exist[0].user_session_set.filter(session_id=user_session)
                    print(user_already_in_session)
                    if len(user_already_in_session) == 0:
                        user_to_add = user_exist[0]
                        User_Session(user_id=user_to_add, session_id=user_session).save()
        elif new_session_name is not None:
            new_session_name = new_session_name.strip()
            new_session = Session(name=new_session_name)
            new_session.save()
            User_Session(user_id=request.user, session_id=new_session).save()
    context = {
        'sessions': res
    }
    return render(request, 'post_it/sessions.html', context)
