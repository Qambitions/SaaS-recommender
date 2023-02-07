import os
import sys
import django

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf


# import tensorflow_datasets as tfds
import tensorflow_recommenders as tfrs
from sklearn.cluster import KMeans
from .models import *
from datetime import datetime
import string
import random
import joblib

from dimadb.tmp import prepare_data
from django.db.models import Q, Count, F, Sum, Max
from datetime import datetime, date

def id_generator(size=7, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

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

class HotModel():
    def __init__(self,DB_client):
        super().__init__()
        web_event  =  pd.DataFrame(WebEvent.objects.using(DB_client).exclude(event_type = "Remove from cart").values())
        event_item =  pd.DataFrame(EventItem.objects.using(DB_client).all().values())
        self.ready = True
        if web_event.shape[0] == 0 or event_item.shape[0] == 0:
            self.ready = False
            return
        event_item.event_id = event_item.event_id.astype('int64')
        df = web_event.merge(event_item,how="left", on = 'event_id')
        groupby_object = df.groupby(by=['product_id'], as_index=True, sort=False)
        # print(result[:top_n])
        result   = groupby_object.size().reset_index(name='counts')
        result   = result.sort_values(by=['counts'],ascending=False)
        self.res = result

def calculate_age(birthday):
    today = date.today()
    return today.year - birthday.year

class DemographicModel():
    def __init__(self,DB_client):
        super().__init__()
        df = pd.DataFrame(CustomerProfile.objects.using(DB_client).values('dob', 'gender','city'))
        # print(df)
        self.ready = True
        if df.shape[0] == 0:
            self.ready = False
            return
        df['age'] = df['dob'].apply(calculate_age)
        df['city_label']   = df['city'].rank(method='dense', ascending=True).astype(int)
        df['gender_label'] = df['gender'].rank(method='dense', ascending=True).astype(int)
        self.data  = df[['city_label','gender_label','age']]
        self.model = KMeans(n_clusters=5)

class ListModel(metaclass = SingletonMeta):
    def __init__(self,num=2):
        super().__init__()
        self.number_model = 2
        # self.list_model_colab = {"test1"  : RetailModel('test1'),
        #                         "test2" : RetailModel('test2')}

        # self.list_model_hot   = {"test1"  : HotModel('test1'),
        #                         "test2" : HotModel('test2')}

        self.list_model_demographic = {"test1"  : DemographicModel('test1'),
                                "test2" : DemographicModel('test2')}
    
    def train_model_colab(self, DB_client):
        model = RetailModel(DB_client)
        model.compile(optimizer=tf.keras.optimizers.Adagrad(0.1))
        train = model.ratings.take(100000)
        cached_train = train.shuffle(100_000).batch(1_000).cache()
        model.fit(cached_train, epochs=5)
        self.list_model_colab[DB_client] = model
        name = id_generator()
        model.save_weights('./model/'+name, save_format='tf')
        x = RecommenderModel(created_at = datetime.now(), model_type = "colab",model_path='./model/'+name)
        x.save(using=DB_client)
    
    def train_model_hot(self, DB_client):
        self.list_model_colab[DB_client] = HotModel(DB_client)

    def train_model_demographic(self, DB_client):
        model_class = DemographicModel(DB_client)
        print("aaa")
        model = model_class.model
        model.fit(model_class.data)
        self.list_model_demographic[DB_client] = model_class
        name = id_generator()
        joblib.dump(model, './model/'+name)
        x = RecommenderModel(created_at = datetime.now(), model_type = "demo",model_path='./model/'+name)
        x.save(using=DB_client)


def start_model():
    models = ListModel()

def to_dictionary(df):
    return {name: np.array(value) for name, value in df.items()}

def train_model_colab(DB_client):
    models = ListModel()
    models.train_model_colab(DB_client)
    return True  

def train_model_demo(DB_client):
    models = ListModel()
    models.train_model_demographic(DB_client)
    return True  

def load_model_colab(DB_client):
    models = ListModel()
    predict_model = models.list_model_colab[DB_client]
    #query path file
    recomemnder = RecommenderModel.objects.using(DB_client).filter(model_type = "colab")
    max_time    = recomemnder.aggregate(max_time=Max('created_at'))['max_time']
    record      = recomemnder.filter(created_at = max_time)
    path        = record[0].model_path
    predict_model.load_weights(path) 
    return predict_model

def load_model_demo(DB_client):
    models = ListModel()
    predict_model = models.list_model_demographic[DB_client].model
    recomemnder = RecommenderModel.objects.using(DB_client).filter(model_type = "demo")
    max_time    = recomemnder.aggregate(max_time=Max('created_at'))['max_time']
    record      = recomemnder.filter(created_at = max_time)
    path        = record[0].model_path
    predict_model = joblib.load(path)
    return predict_model


def predict_product_colab(user, top_n=3,DB_client = ""):
    # unique_user_ids,unique_product_id,unique_product_category,product_popular_scores_buckets,products,ratings = demo()
    user = {f"customer_id":[user]}
    user = to_dictionary(user)
    models = ListModel()
    if models.list_model_colab[DB_client].ready == False:
        return "chưa có model"
    
    unique_user_ids                 = models.list_model_colab[DB_client].unique_user_ids               
    unique_product_id               = models.list_model_colab[DB_client].unique_product_id             
    unique_product_category         = models.list_model_colab[DB_client].unique_product_category       
    product_popular_scores_buckets  = models.list_model_colab[DB_client].product_popular_scores_buckets
    products                        = models.list_model_colab[DB_client].products                      
    ratings                         = models.list_model_colab[DB_client].ratings
    
    #TODO: load from db
    predict_model =  load_model_colab(DB_client)
    
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

def predict_model_hot(top_n=3, DB_client = ""):
    models = ListModel()
    
    if models.list_model_hot[DB_client].ready == False:
        return "chưa có model"
    result = models.list_model_hot[DB_client].res
    return result[:top_n]

def predict_model_demo(user, top_n=3, DB_client = ""):
    models = ListModel()
    if models.list_model_demographic[DB_client].ready == False:
        return "chưa có model"
    predict_model =  load_model_demo(DB_client)
    df_cus = pd.DataFrame(CustomerProfile.objects.using(DB_client).values())
    df_cus['age'] = df_cus['dob'].apply(calculate_age)
    df_cus['city_label']   = df_cus['city'].rank(method='dense', ascending=True).astype(int)
    df_cus['gender_label'] = df_cus['gender'].rank(method='dense', ascending=True).astype(int)
    df_cus['clustering']   = predict_model.predict(df_cus[['city_label','gender_label','age']])
    cluster_user = df_cus[df_cus['customer_id'] == user].iloc[0]['clustering']
    print(cluster_user)
    df_tmp = df_cus[df_cus['clustering'] == cluster_user]
    list_user = df_tmp['customer_id'].tolist()
    print(list_user)
    session   = pd.DataFrame(Session.objects.using(DB_client).\
                                filter(customer_id__in = list_user).values())
    web_event  =  pd.DataFrame(WebEvent.objects.using(DB_client).exclude(event_type = "Remove from cart").values())
    event_item =  pd.DataFrame(EventItem.objects.using(DB_client).all().values())
    web_event.session_id = web_event.session_id.astype('int64')
    event_item.event_id = event_item.event_id.astype('int64')
    df = session.merge(web_event,how='inner', on = 'session_id')
    df = df.merge(event_item,how='inner', on = 'event_id')
    groupby_object = df.groupby(by=['product_id'], as_index=True, sort=False)
    # print(result[:top_n])
    result   = groupby_object.size().reset_index(name='counts')
    result   = result.sort_values(by=['counts'],ascending=False)
    return result[:top_n]

def magic_test(DB_client):
    # train_model_demo(DB_client)
    predict_model_demo("1000000",DB_client='test2')

if __name__ == "__main__":

    print(predict_product_colab("1000000"))
    a = InitClass()
    