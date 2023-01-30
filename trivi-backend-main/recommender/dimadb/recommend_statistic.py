import os
import sys
import django

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf
from datetime import datetime,timedelta
from .models import *
from django.db.models import Q, Count, F, Sum, Max

def login_statistic(user_name, token):
    print(user_name, token)
    Customer.objects.filter(username=user_name).update(token=token)

def session_event_management(event_type, user_id, product = ""):
    # get session
    session_user = Session.objects.filter(customer_id=user_id)
    max_time     = session_user.aggregate(max_time=Max('end_time'))['max_time']
    now_time     = datetime.now()
    
    # upsert session
    session_id = ''
    if max_time + timedelta(minutes=15) < now_time:
        # create new session
        x = Session(start_time = now_time, end_time = now_time, customer_id = user_id)
        x.save()
        max_time = now_time
    record = session_user.filter(end_time = max_time)
    session_id = record[0].id
    record[0].end_time = now_time
    record[0].save()

    # follow event type
    if event_type == 'login':
        ...
    elif event_type == 'click':
        ...
    elif event_type == 'view':
        ...
    elif event_type == 'add to cart':
        ...
    elif event_type == 'remove from cart':
        ...
