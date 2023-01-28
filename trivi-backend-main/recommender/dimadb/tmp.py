import os, warnings, sys

sys.path.insert(0, '')

warnings.filterwarnings('ignore')

import matplotlib, pandas as pd
from recommender import settings
config = settings
import pandas as pd
import numpy  as np
import tensorflow as tf
from .models import *

from src.utils.database import check_na_df, query_to_df, insert_update
from .models import*

def to_dictionary(df):
    return {name: np.array(value) for name, value in df.items()}

def demo():
    df_customer = pd.DataFrame(Customer.objects.all().values())
    df_customer = df_customer.astype(str)
    unique_user_ids = np.unique(list(df_customer.customer_id))

    df_product = pd.DataFrame(Product.objects.all().values())
    df_product.prod_name = df_product.product_name.astype(str)
    df_product.category = df_product.category.astype(str)
    unique_product_id = np.unique(list(df_product.product_name))
    unique_product_category = np.unique(list(df_product.category))
 
    product_max_popular_scores = df_product.price.max()
    product_min_popular_scores = df_product.price.min()
    product_popular_scores_buckets = np.linspace( product_min_popular_scores, product_max_popular_scores, num=10,)
    df_product.rename(columns={"category": "prod_category",
                                "current_price":'prod_price'}, inplace = True)
    products = tf.data.Dataset.from_tensor_slices(to_dictionary(df_product[['prod_name','prod_category','prod_price']]))

    df_customer_session = pd.DataFrame(CustomerSession.objects.all().values())
    df_web_event   = pd.DataFrame(WebEvent.objects.all().values())
    df_ratings = pd.DataFrame(EventItem.objects.all().values())
    df_ratings = df_ratings.merge(df_web_event, on = 'event_id')
    df_ratings = df_ratings.merge(df_customer_session, on = 'session_id')
    df_ratings = df_ratings.merge(df_product, on = 'product_id')
    df_ratings = df_ratings[["product_name",	
                                "customer_id", "price",	
                                "category"]]
    df_ratings.drop_duplicates(inplace=True)
    df_ratings.reset_index(inplace = True)
    df_ratings.customer_id = df_ratings.customer_id.astype(str)
    df_ratings.prod_category = df_ratings.category.astype(str)
    ratings = tf.data.Dataset.from_tensor_slices(to_dictionary(df_ratings))

    return unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings

# if __name__ == "__main__":
#     print("test")
#     # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
#     item = Product.objects.all().values()
#     df = pd.DataFrame(item)