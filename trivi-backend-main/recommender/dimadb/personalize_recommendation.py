import os

import django

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf

# import tensorflow_datasets as tfds
import tensorflow_recommenders as tfrs

# hyper parameter // normalize before

unique_user_ids                = None
# user_nmv_buckets               = None
unique_product_id              = None
product_popular_scores_buckets = None
unique_product_category        = None
products                       = None

class UserModel(tf.keras.Model):
    def __init__(self):
        super().__init__()     
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
            self.user_embedding(inputs["user_id"])], axis=1)
        

class ItemModel(tf.keras.Model):
    def __init__(self):
        super().__init__()
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
            self.title_embedding(inputs["product_id"]),
            self.popular_scores_embedding(inputs["popular_score"]),
            self.category_embedding(inputs["product_category"])
        ], axis=1)

class RetailModel(tfrs.models.Model):
    def __init__(self):
        super().__init__()        

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
        
        query_embeddings = self.user_model({ "user_id"           : features["user_id"],
                                               "user_nmv"        : features["user_nmv"],})
        
        item_embeddings = self.product_model({ "product_id"      : features["product_id"],
                                               "popular_score"   : features["popular_score"],
                                               "product_category": features["product_category"]})

        return self.task(query_embeddings, item_embeddings)

def load_model():
    ...

def predict_movie(model, user, top_n=3):
    # Create a model that takes in raw query features, and
    index = tfrs.layers.factorized_top_k.BruteForce(model.user_model)
    # recommends movies out of the entire movies dataset.
    index.index_from_dataset(
    tf.data.Dataset.zip((products.map(lambda x: x["product_id"]).batch(100), products.batch(100).map(model.product_model)))
    )
    # index.index(products.batch(128).map(model.product_model), products.batch(128))

    # Get recommendations.
    _, titles = index(user)
    
    print('Top {} recommendations for user {}:\n'.format(top_n, user))
    for i, title in enumerate(titles[0, :top_n].numpy()):
        print('{}. {}'.format(i+1, title.decode("utf-8")))

def train_model():
    ratings = None
    train = ratings.take(35000)
    cached_train = train.shuffle(100_000).batch(1_000).cache()
    model = RetailModel()
    model.compile(optimizer=tf.keras.optimizers.Adagrad(0.1))
    model.fit(cached_train, epochs=3)