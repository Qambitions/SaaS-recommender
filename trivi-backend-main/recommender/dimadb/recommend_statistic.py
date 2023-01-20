import os
import sys
import django

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf

from .models import *

def login_statistic(user_name, token):
    print(user_name, token)
    Customer.objects.filter(username=user_name).update(token=token)
    # nhắc nhở!! add section
