from multiprocessing import synchronize
from django.urls import path
from .views import *

urlpatterns = [
    path('get-clicks/', get_report),
    path('get-capture/', get_capture),
    path('test/', test),
    path('allocate-database/', allocate_database),
    path('check-allocate-database/', check_allocate_database),
    path('add-recommender-strategy/', add_recommender_strategy),
    path('train-colab-model/', train_colab_model_api),
    path('add-scheduler/', add_scheduler),
    path('train-demographic-model/', train_demographic_model_api),
    path('train-hot-model/', train_hot_model_api),
    path('train-content-model/', train_contentbase_model_api),
    path('import-csv/', import_csv),
    path('get-key-metrics/', get_key_metrics),
    path('get-hot-items/', get_list_hot_items),
]
