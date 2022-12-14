import os, warnings, sys

sys.path.insert(0, '')

warnings.filterwarnings('ignore')

import matplotlib, pandas as pd
from recommender import settings
config = settings
import pandas as pd
import numpy  as np
import tensorflow as tf

from src.utils.database import check_na_df, query_to_df, insert_update

def to_dictionary(df):
    return {name: np.array(value) for name, value in df.items()}

def demo():
    df_customer = query_to_df("""
                                select * from customer
                                """)
    df_customer = df_customer.astype(str)
    unique_user_ids = np.unique(list(df_customer.cus_id))

    df_product = query_to_df("""
                            select * from product
                            """)
    df_product.prod_name = df_product.prod_name.astype(str)
    df_product.category = df_product.category.astype(str)
    unique_product_id = np.unique(list(df_product.prod_name))
    unique_product_category = np.unique(list(df_product.category))
 
    product_max_popular_scores = df_product.current_price.max()
    product_min_popular_scores = df_product.current_price.min()
    product_popular_scores_buckets = np.linspace( product_min_popular_scores, product_max_popular_scores, num=10,)
    df_product.rename(columns={"category": "prod_category",
                                "current_price":'prod_price'}, inplace = True)
    products = tf.data.Dataset.from_tensor_slices(to_dictionary(df_product[['prod_name','prod_category','prod_price']]))

    df_ratings = query_to_df("""
                            select p.prod_name , cs.customer_id,p.current_price as prod_price,p.category as prod_category
                            from event_item ei
                            join web_event we on ei.event_id = we.event_id 
                            join customer_session cs  on cs.session_id = we.session_id 
                            join product p  on we.event_id = p.prod_id 
                            """)
    df_ratings.customer_id = df_ratings.customer_id.astype(str)
    df_ratings.prod_category = df_ratings.prod_category.astype(str)
    ratings = tf.data.Dataset.from_tensor_slices(to_dictionary(df_ratings))

    return unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings

if __name__ == "__main__":
    print("test")
    unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()