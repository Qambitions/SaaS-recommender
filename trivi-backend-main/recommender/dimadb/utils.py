import random
import json
import uuid
import os
import pydash
import urllib3
import pandas as pd
from .models import *

# Function return an object in json file
def get_json_info(file_path, obj_key):
    json_file = open(file_path)
    json_data = json.load(json_file)
    json_info = pydash.get(json_data, obj_key)
    json_file.close()
    return json_info


# Filter some key attributes of an existing object, which is sent from imported file => create new object
def filter_imported_object_info(list_attributes, obj):
    new_obj = {}
    for attribute in list_attributes:
        attribute_info = list_attributes[attribute]
        if 'default' in attribute_info:
            new_obj[attribute] = attribute_info['default']
        elif 'source_name' in attribute_info:
            if (type(obj) is dict):
                source_value = pydash.get(obj, attribute_info['source_name'])
            else:
                source_value = obj   
            if (source_value == 0 or source_value == '0'):
                new_obj[attribute] = source_value
            else:
                new_obj[attribute] = source_value or None
            
    return new_obj


# Filter some key attributes of an existing object, which is sent from form => create new object
def filter_form_object_info(obj):
    new_obj = {}
    for attribute in obj.keys():
        if attribute != 'id':
            obj_type = obj[attribute]['type']
            obj_value = obj[attribute]['value']

            if obj_type != 'm2m' and obj_type != 'o2m':
                if obj_type == 'integer' or obj_type == 'decimal':
                    if obj_value == '':
                        new_obj[attribute] = 0
                    else:
                        new_obj[attribute] = obj_value
                elif obj_type == 'date' or obj_type == 'datetime':
                    if obj_value == '':
                        new_obj[attribute] = None
                    else:
                        new_obj[attribute] = obj_value
                else:
                    new_obj[attribute] = obj_value

    return new_obj

def check_allow_fields(df, model):
    compulsory_fields = [field.name for field in model._meta.get_fields() if field.null==False]
    all_fields = [field.name for field in model._meta.get_fields()]
    for field in compulsory_fields:
        if field not in df.columns:
            return False,df
    fields_list = []
    for field in df.columns:
        if field in all_fields:
            fields_list.append(field)
            field_type = model._meta.get_field(field).get_internal_type()
            if field_type == 'DateTimeField': 
                df[field] = pd.to_datetime(df[field])
    return fields_list,df

def add_df_model_with_some_fields(df, model, right_fields=[]):
    objects_list = []
    for i, row in df.iterrows():
        instance = model()
        for j in right_fields:
            # instance[j] = row[j]
            setattr(instance,j,row[j])
        objects_list.append(instance)
    model.objects.bulk_create(objects_list)

def add_more_information_for_product_id(list_product, DB_client):    
    df_product = pd.DataFrame(Product.objects.using(DB_client).values())
    res = []
    for i in list_product:
        product = df_product[df_product['product_id'] == i]
        res.append({"id":product['product_id'].iat[0],
                    "name":product['product_name'].iat[0],
                    "url":product['url'].iat[0],
                    "image":product['image'].iat[0]})
    return res