from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(models.Model):
    username      = models.CharField(max_length=150, primary_key=True, blank=True, unique=True)
    name_company  = models.CharField(max_length=150, null=False, blank=True)
    database_name = models.CharField(max_length=150, null=False, blank=True)
    service       = models.CharField(max_length=150, null=False, blank=True)
    token         = models.CharField(max_length=150, null=False, blank=True)
    date_joined = models.DateTimeField(default=timezone.now)
    email = models.EmailField(
        unique=True,
        max_length=254
    )
    