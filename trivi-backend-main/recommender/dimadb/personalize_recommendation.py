import os
import sys
import django

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf

# import tensorflow_datasets as tfds
import tensorflow_recommenders as tfrs
from .models import *
from datetime import datetime
import string
import random

from dimadb.tmp import prepare_data
from django.db.models import Q, Count, F, Sum, Max

def id_generator(size=7, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))
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

class InitClass:
    def __init__(self,DB_client):
        super().__init__() 
        tmp = prepare_data(DB_client)
        self.ready = True
        if tmp==False:
            self.ready = False
            return

        self.unique_user_ids                 = tmp[0]               
        self.unique_product_id               = tmp[1] 
        self.unique_product_category         = tmp[2]
        self.product_popular_scores_buckets  = tmp[3]
        self.products                        = tmp[4]
        self.ratings                         = tmp[5]


class UserModel(tf.keras.Model):
    def __init__(self,DB_client):
        super().__init__()     
        # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
        tmp = InitClass(DB_client)
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
        

class ItemModel(tf.keras.Model):
    def __init__(self,DB_client):
        super().__init__()
        # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
        tmp = InitClass(DB_client)
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
            self.title_embedding(inputs["product_name"]),
            self.popular_scores_embedding(inputs["price"]),
            self.category_embedding(inputs["category"])
        ], axis=1)

class RetailModel(tfrs.models.Model):
    def __init__(self,DB_client):
        super().__init__()        
        # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
        tmp = InitClass(DB_client)
        self.ready = True
        if tmp.ready == False: 
            self.ready = False
            return

        self.unique_user_ids                 = tmp.unique_user_ids               
        self.unique_product_id               = tmp.unique_product_id             
        self.unique_product_category         = tmp.unique_product_category       
        self.product_popular_scores_buckets  = tmp.product_popular_scores_buckets
        self.products                        = tmp.products                      
        self.ratings                         = tmp.ratings
        ## user model is user model
        self.user_model = tf.keras.Sequential([
                          UserModel(DB_client),
                          tf.keras.layers.Dense(12)])
        
        ## product model is the item model
        self.product_model = tf.keras.Sequential([
                              ItemModel(DB_client),
                              tf.keras.layers.Dense(12)])
        
        ## retrieval task, choose metrics
        self.task = tfrs.tasks.Retrieval(
                    metrics=tfrs.metrics.FactorizedTopK(
                        candidates=self.products.batch(128).map(self.product_model)
                    )
        )

    def compute_loss(self, features, training=False):
        # We only pass the user id and timestamp features into the query model. This
        # is to ensure that the training inputs would have the same keys as the
        # query inputs. Otherwise the discrepancy in input structure would cause an
        # error when loading the query model after saving it.
        
        query_embeddings = self.user_model({ "customer_id"           : features["customer_id"]})
        
        item_embeddings = self.product_model({ "product_name"      : features["product_name"],
                                               "price"   : features["price"],
                                               "category": features["category"]})

        return self.task(query_embeddings, item_embeddings)

class ListModel(metaclass = SingletonMeta):
    def __init__(self,num=2):
        super().__init__()
        self.number_model = 2
        self.list_model = {"test1"  : RetailModel('test1'),
                            "test2" : RetailModel('test2')}
    
    def train_model(self, DB_client):
        model = RetailModel(DB_client)
        model.compile(optimizer=tf.keras.optimizers.Adagrad(0.1))
        train = model.ratings.take(100000)
        cached_train = train.shuffle(100_000).batch(1_000).cache()
        model.fit(cached_train, epochs=5)
        self.list_model[DB_client] = model
        name = id_generator()
        model.save_weights('./model/'+name, save_format='tf')
        x = RecommenderModel(created_at = datetime.now(), model_type = "colab",model_path='./model/'+name)
        x.save(using=DB_client)

def start_model():
    models = ListModel()

def to_dictionary(df):
    return {name: np.array(value) for name, value in df.items()}

def train_model(DB_client):
    models = ListModel()
    models.train_model(DB_client)
    return True  

def load_model(DB_client):
    models = ListModel()
    predict_model = models.list_model[DB_client]
    #query path file
    recomemnder = RecommenderModel.objects.using(DB_client)
    max_time    = recomemnder.aggregate(max_time=Max('created_at'))['max_time']
    record      = recomemnder.filter(created_at = max_time)
    path        = record[0].model_path
    predict_model.load_weights(path) 
    return predict_model

def predict_product(user, top_n=3,DB_client = ""):
    # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
    user = {f"customer_id":[user]}
    user = to_dictionary(user)
    models = ListModel()
    if models.list_model[DB_client].ready == False:
        return "chưa có model"
    
    unique_user_ids                 = models.list_model[DB_client].unique_user_ids               
    unique_product_id               = models.list_model[DB_client].unique_product_id             
    unique_product_category         = models.list_model[DB_client].unique_product_category       
    product_popular_scores_buckets  = models.list_model[DB_client].product_popular_scores_buckets
    products                        = models.list_model[DB_client].products                      
    ratings                         = models.list_model[DB_client].ratings
    
    #TODO: load from db
    predict_model =  load_model(DB_client)
    
    # Create a model that takes in raw query features, and
    index = tfrs.layers.factorized_top_k.BruteForce(predict_model.user_model)
    # recommends movies out of the entire movies dataset.
    index.index_from_dataset(
    tf.data.Dataset.zip((products.map(lambda x: x["product_name"]).batch(100), products.batch(100).map(predict_model.product_model)))
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

if __name__ == "__main__":

    print(predict_product("1000000"))
    a = InitClass()
    