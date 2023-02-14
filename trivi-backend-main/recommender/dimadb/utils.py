import pandas as pd
from .models import *

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

def add_df_model_with_some_fields(df, model,DB_client, right_fields=[]):
    objects_list = []
    for i, row in df.iterrows():
        instance = model()
        for j in right_fields:
            # instance[j] = row[j]
            setattr(instance,j,row[j])
        objects_list.append(instance)
    model.objects.using(DB_client).bulk_create(objects_list)

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