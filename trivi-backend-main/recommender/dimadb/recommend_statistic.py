import os
import sys
import django
import asyncio
from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf
from datetime import datetime,timedelta
from .models import *
from django.db.models import Q, Count, F, Sum, Max
from asgiref.sync import sync_to_async
from django.utils import timezone

def login_statistic(DB_client, user_name, token):
    # print(user_name, token)
    x = Customer.objects.using(DB_client).filter(username=user_name).update(token=token)

def session_event_management(event_type, DB_client, user_id, product_url = ""):
    # get session
    session_user = Session.objects.using(DB_client).filter(customer_id=user_id)
    max_time     = session_user.aggregate(max_time=Max('end_time'))['max_time']
    now_time     = timezone.now()
    # print(product_url)
    # upsert session
    session_id = ''
    if max_time is None or  max_time + timedelta(minutes=15) < now_time:
        # create new session
        e1 = Session(start_time = now_time, end_time = now_time, customer_id = user_id)
        e1.save(using = DB_client)
        max_time = now_time
    record = session_user.filter(end_time = max_time)
    session_id = record[0].session_id
    record.update(end_time = now_time)
    # record[0].save(using = DB_client)

    e2 = WebEvent(event_type = event_type,session_id = session_id)
    e2.save(using = DB_client)
    event_id = e2.event_id
    # follow event type
    if event_type == 'Login':
        # do nothing
        ...
    elif event_type == 'Click':
        product_filter = Product.objects.using(DB_client).filter(url=product_url)
        if product_filter:
            product_id = product_filter.all()[0].product_id
        else: product_id = None
        e3 = EventItem(event_id= event_id,product_id = product_id,quantity = 1,price=0)
        e3.save(using = DB_client)
    elif event_type == 'View':
        # product_filter = Product.objects.using(DB_client).filter(url=product_url)
        # if product_filter:
        #     product_id = product_filter.all()[0].product_id
        # else: product_id = None
        # e3 = EventItem(event_id= event_id,product_id = product_id,quantity = 1,price=0)
        # e3.save(using = DB_client)
        ...
    elif event_type == 'Add to cart':
        product_filter = Product.objects.using(DB_client).filter(url=product_url)
        if product_filter:
            product_id = product_filter.all()[0].product_id
        else: product_id = None
        e3 = EventItem(event_id= event_id,product_id = product_id,quantity = 1,price=0)
        e3.save(using = DB_client)
    elif event_type == 'Remove from cart':
        product_filter = Product.objects.using(DB_client).filter(url=product_url)
        if product_filter:
            product_id = product_filter.all()[0].product_id
        else: product_id = None
        e3 = EventItem(event_id= event_id,product_id = product_id,quantity = 1,price=0)
        e3.save(using = DB_client)

    return True 
