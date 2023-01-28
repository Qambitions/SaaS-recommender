import os
import sys
import django

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf

# import tensorflow_datasets as tfds
import tensorflow_recommenders as tfrs

from dimadb.tmp import demo
# hyper parameter // normalize before

# unique_user_ids                = None

# unique_product_id              = None
# product_popular_scores_buckets = None
# unique_product_category        = None
# products                       = None

class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class InitClass(metaclass = SingletonMeta):
    def __init__(self):
        super().__init__() 
        self.unique_user_ids,\
            self.unique_product_id,\
            self.unique_product_category,\
            self.product_popular_scores_buckets,\
            self.products,\
            self.ratings = demo()


class UserModel(tf.keras.Model,metaclass = SingletonMeta):
    def __init__(self):
        super().__init__()     
        # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
        tmp = InitClass()
        unique_user_ids                 = tmp.unique_user_ids               
        unique_product_id               = tmp.unique_product_id             
        unique_product_category         = tmp.unique_product_category       
        product_popular_scores_buckets  = tmp.product_popular_scores_buckets
        products                        = tmp.products                      
        ratings                         = tmp.ratings                       
        self.embedding_dimension = 32   
        max_tokens = 10_000

        # user id
        self.user_embedding = tf.keras.Sequential([tf.keras.layers.experimental.preprocessing.StringLookup(
                                                    vocabulary=unique_user_ids, mask_token=None),
                                                    tf.keras.layers.Embedding(len(unique_user_ids) + 1, self.embedding_dimension),])
        #nmv
        # self.nmv_embedding = tf.keras.Sequential([
        #                             tf.keras.layers.experimental.preprocessing.Discretization(user_nmv_buckets.tolist()),
        #                             tf.keras.layers.Embedding(len(user_nmv_buckets) + 1, self.embedding_dimension),])
        
      
    def call(self, inputs):
        # Take the input dictionary, pass it through each input layer,
        # and concatenate the result.
        # print("tttt",inputs)
        # print('1',self.user_embedding(inputs["user_id"]))
        # print('2',self.nmv_embedding(inputs["user_nmv"]))
        return tf.concat([
            self.user_embedding(inputs["customer_id"])], axis=1)
        

class ItemModel(tf.keras.Model,metaclass = SingletonMeta):
    def __init__(self):
        super().__init__()
        # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
        tmp = InitClass()
        unique_user_ids                 = tmp.unique_user_ids               
        unique_product_id               = tmp.unique_product_id             
        unique_product_category         = tmp.unique_product_category       
        product_popular_scores_buckets  = tmp.product_popular_scores_buckets
        products                        = tmp.products                      
        ratings                         = tmp.ratings
        self.embedding_dimension = 24

        ## embed title from unique_item_titles
        self.title_embedding = tf.keras.Sequential([
                      tf.keras.layers.experimental.preprocessing.StringLookup(
                          vocabulary=unique_product_id, mask_token=None),
                      tf.keras.layers.Embedding(len(unique_product_id) + 1, self.embedding_dimension)])

        #popular scores
        self.popular_scores_embedding = tf.keras.Sequential([
                                    tf.keras.layers.experimental.preprocessing.Discretization(product_popular_scores_buckets.tolist()),
                                    tf.keras.layers.Embedding(len(product_popular_scores_buckets) + 1, self.embedding_dimension),])
        
        # product category  
        self.category_embedding = tf.keras.Sequential([
                                  tf.keras.layers.experimental.preprocessing.StringLookup(
                                    vocabulary=unique_product_category, mask_token=None),
                                  tf.keras.layers.Embedding(len(unique_product_category) + 1, 
                                  self.embedding_dimension)])
        

    def call(self, inputs):
        # print("tttt",inputs["product_category"])
        # print('1',self.title_embedding(inputs["product_id"]))
        # print('2',self.popular_scores_embedding(inputs["popular_score"]))
        # print('3',self.category_embedding(inputs["product_category"]))
        return tf.concat([
            self.title_embedding(inputs["prod_name"]),
            self.popular_scores_embedding(inputs["prod_price"]),
            self.category_embedding(inputs["prod_category"])
        ], axis=1)

class RetailModel(tfrs.models.Model,metaclass = SingletonMeta):
    def __init__(self):
        super().__init__()        
        # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
        tmp = InitClass()
        unique_user_ids                 = tmp.unique_user_ids               
        unique_product_id               = tmp.unique_product_id             
        unique_product_category         = tmp.unique_product_category       
        product_popular_scores_buckets  = tmp.product_popular_scores_buckets
        products                        = tmp.products                      
        ratings                         = tmp.ratings
        ## user model is user model
        self.user_model = tf.keras.Sequential([
                          UserModel(),
                          tf.keras.layers.Dense(12)])
        
        ## product model is the item model
        self.product_model = tf.keras.Sequential([
                              ItemModel(),
                              tf.keras.layers.Dense(12)])
        
        ## retrieval task, choose metrics
        self.task = tfrs.tasks.Retrieval(
                    metrics=tfrs.metrics.FactorizedTopK(
                        candidates=products.batch(128).map(self.product_model)
                    )
        )

    def compute_loss(self, features, training=False):
        # We only pass the user id and timestamp features into the query model. This
        # is to ensure that the training inputs would have the same keys as the
        # query inputs. Otherwise the discrepancy in input structure would cause an
        # error when loading the query model after saving it.
        
        query_embeddings = self.user_model({ "customer_id"           : features["customer_id"]})
        
        item_embeddings = self.product_model({ "prod_name"      : features["prod_name"],
                                               "prod_price"   : features["prod_price"],
                                               "prod_category": features["prod_category"]})

        return self.task(query_embeddings, item_embeddings)

def load_model():
    ...

def to_dictionary(df):
    return {name: np.array(value) for name, value in df.items()}

def predict_product(user, top_n=3):
    # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
    tmp = InitClass()
    unique_user_ids                 = tmp.unique_user_ids               
    unique_product_id               = tmp.unique_product_id             
    unique_product_category         = tmp.unique_product_category       
    product_popular_scores_buckets  = tmp.product_popular_scores_buckets
    products                        = tmp.products                      
    ratings                         = tmp.ratings
    user = {f"customer_id":[user]}
    user = to_dictionary(user)
    #TODO: load from db
    model = RetailModel()
    model.load_weights('./model/content_model_weights')
    # Create a model that takes in raw query features, and
    index = tfrs.layers.factorized_top_k.BruteForce(model.user_model)
    # recommends movies out of the entire movies dataset.
    index.index_from_dataset(
    tf.data.Dataset.zip((products.map(lambda x: x["prod_name"]).batch(100), products.batch(100).map(model.product_model)))
    )
    # index.index(products.batch(128).map(model.product_model), products.batch(128))

    # Get recommendations.
    _, titles = index(user)
    
    print('Top {} recommendations for user {}:\n'.format(top_n, user))
    # print(titles)
    list_predict = []
    for i, title in enumerate(titles[0, :top_n].numpy()):
        # print('{}. {}'.format(i+1, title.decode("utf-8")))
        list_predict.append(title.decode("utf-8"))
    return list_predict


def train_model():
    # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
    tmp = InitClass()
    unique_user_ids                 = tmp.unique_user_ids               
    unique_product_id               = tmp.unique_product_id             
    unique_product_category         = tmp.unique_product_category       
    product_popular_scores_buckets  = tmp.product_popular_scores_buckets
    products                        = tmp.products                      
    ratings                         = tmp.ratings
    train = ratings.take(35000)
    cached_train = train.shuffle(100_000).batch(1_000).cache()
    model = RetailModel()
    model.compile(optimizer=tf.keras.optimizers.Adagrad(0.1))
    model.fit(cached_train, epochs=3)

if __name__ == "__main__":
    # train = ratings.take(35000)
    # cached_train = train.shuffle(100_000).batch(1_000).cache()
    # model = RetailModel()
    # model.compile(optimizer=tf.keras.optimizers.Adagrad(0.1))
    # model.fit(cached_train, epochs=3)
    # model.save_weights('./model/content_model_weights', save_format='tf')

    print(predict_product("1000000"))
    a = InitClass()
    