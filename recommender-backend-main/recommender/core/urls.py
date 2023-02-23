from django.urls import path
from .views import *
urlpatterns = [
    path('change-password/', change_password),
    path('current-user/', current_user),
    path('users/', UserList.as_view()),
    path('register/', UserCreate)
]