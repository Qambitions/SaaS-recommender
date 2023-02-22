from datetime import datetime, timedelta

from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.operators.python import PythonOperator
from airflow.decorators import dag, task
from datetime import datetime
from airflow.utils.dates import days_ago
import requests

CURRENT_TIME = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
HOST         = 'http://192.168.150.1:8000/'

default_args = {
    'owner': 'khoabui',
    'retries': 3,
    'retry_delay': timedelta(minutes=15),
    'start_date': days_ago(0),
}

@dag(
    dag_id='task_daily',
    default_args=default_args,
    schedule="@daily",
    dagrun_timeout=timedelta(minutes=60),
) 
def task_daily():
    @task()
    def call_train_daily_task():
        pg_hook = PostgresHook(postgres_conn_id="management")
        df_scheduler = pg_hook.get_pandas_df(
                                sql=f"""SELECT *
                                        FROM public.dimadb_scheduler
                                        where cycle_time = 1
                                    """
                        )
        all_true = True
        print("query DONE")
        for index, row in df_scheduler.iterrows():
            if row.strategy == 'colab':
                response = requests.post(HOST + 'dimadb/train-colab-model/', json = {"database_name":row.database_name})
            elif row.strategy == 'demographic':
                response = requests.post(HOST + 'dimadb/train-demographic-model/', json = {"database_name":row.database_name})
        
            if response.status_code != 200:
                print("DB problem: "+row.database_name)
                all_true = False
        response = requests.post(HOST + 'dimadb/train-all-hot-model/')
        response = requests.post(HOST + 'dimadb/train-all-contentbase-model/')
        if all_true== False:
            raise ValueError('Something wrong')
    call_train_daily_task()

@dag(
    dag_id='task_weekly',
    default_args=default_args,
    schedule="@weekly",
    dagrun_timeout=timedelta(minutes=60),
) 
def task_weekly():
    @task()
    def call_train_weekly_task():
        pg_hook = PostgresHook(postgres_conn_id="management")
        df_scheduler = pg_hook.get_pandas_df(
                                sql=f"""SELECT *
                                        FROM public.dimadb_scheduler
                                        where cycle_time = 7
                                    """
                        )
        all_true = True
        print("query DONE")        
        for index, row in df_scheduler.iterrows():
            if row.strategy == 'colab':
                response = requests.post(HOST + 'dimadb/train-colab-model/', json = {"database_name":row.database_name})
            elif row.strategy == 'demographic':
                response = requests.post(HOST + 'dimadb/train-demographic-model/', json = {"database_name":row.database_name})
        
            if response.status_code != 200:
                print("DB problem: "+row.database_name)
                all_true = False
        
        if all_true == False :
            raise ValueError('Something wrong')
    call_train_weekly_task()


@dag(
    dag_id='task_monthly',
    default_args=default_args,
    schedule="@monthly",
    dagrun_timeout=timedelta(minutes=60),
) 
def task_monthly():
    @task()
    def call_train_monthly_task():
        pg_hook = PostgresHook(postgres_conn_id="management")
        df_scheduler = pg_hook.get_pandas_df(
                                sql=f"""SELECT *
                                        FROM public.dimadb_scheduler
                                        where cycle_time = 30
                                    """
                        )
        all_true = True
        print("query DONE")
        for index, row in df_scheduler.iterrows():
            if row.strategy == 'colab':
                response = requests.post(HOST + 'dimadb/train-colab-model/', json = {"database_name":row.database_name})
            elif row.strategy == 'demographic':
                response = requests.post(HOST + 'dimadb/train-demographic-model/', json = {"database_name":row.database_name})
        
            if response.status_code != 200:
                print("DB problem: "+row.database_name)
                all_true = False
        if all_true == False :
            raise ValueError('Something wrong')
        
    call_train_monthly_task()


task_daily()
task_weekly()
task_monthly()
