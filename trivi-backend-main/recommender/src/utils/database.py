import time
import functools
from datetime import datetime

from psycopg2.sql import SQL, Identifier, Literal
from tqdm import tqdm
import psycopg2
import psycopg2.extras as extras
import pandas as pd
import numpy as np
import pickle
# from utils.misc import timing
from recommender import settings
config = settings


################################################################################
################################################################################
##                    ###    #   #   #####   ####    #   #                    ##
##                   ##  #   #   #   #       #   #   #   #                    ##
##                   #   #   #   #   #####   ####     ###                     ##
##                   #  ##   #   #   #       # #       #                      ##
##                    ## #    ###    #####   #  ##     #                      ##
################################################################################
################################################################################


def query_to_df(command_string, verbose=False):
    """Connect to the database and query to a dataframe
    Database credentials are parsed from `config.py`

    Example:
    >>> command_string = "SELECT * FROM public.mytable"
    >>> df = query_to_df(command_string)
    """
    if verbose:
        print({
            'host'    : config.DB_HOST,
            'port'    : config.DB_PORT,
            'database': config.DB_NAME,
            'user'    : config.DB_USER,
            'password': config.DB_PASSWORD,
        })

    conn = psycopg2.connect(
        host     = config.DB_HOST,
        port     = config.DB_PORT,
        database = config.DB_NAME,
        user     = config.DB_USER,
        password = config.DB_PASSWORD,
        )
    df = pd.read_sql_query(command_string, conn)
    conn.close()
    return df

def empty_table(table_name, verbose=False):
    if verbose:
        print({
                'host'    : config.DB_HOST,
                'port'    : config.DB_PORT,
                'database': config.DB_NAME,
                'user'    : config.DB_USER,
                'password': config.DB_PASSWORD,
        })

    conn = psycopg2.connect(
        host     = config.DB_HOST,
        port     = config.DB_PORT,
        database = config.DB_NAME,
        user     = config.DB_USER,
        password = config.DB_PASSWORD,
    )
    delete_sql = """DELETE FROM {};""".format(table_name)
    cursor = conn.cursor()
    cursor.execute(delete_sql)
    conn.commit()
    cursor.close()
    conn.close()
    print("empty_table() done")


################################################################################
################################################################################
##                   ####    #####   ####    #   #    ####                    ##
##                   #   #   #       #   #   #   #   #                        ##
##                   #   #   #####   ####    #   #   #  ##                    ##
##                   #   #   #       #   #   #   #   #   #                    ##
##                   ####    #####   ####     ###     ####                    ##
################################################################################
################################################################################

def check_na_df(df):
    return pd.DataFrame(df.notna().sum()).style.bar()

################################################################################
################################################################################
##               #####   #   #    ###    #####   ####    #####                ##
##                 #     ##  #   #       #       #   #     #                  ##
##                 #     # # #    ###    #####   ####      #                  ##
##                 #     #  ##       #   #       # #       #                  ##
##               #####   #   #    ###    #####   #  ##     #                  ##
################################################################################
################################################################################


def _generate_data(data, chunk_size=10):
    for i in range(0, len(data), chunk_size):
        yield data[i:i+chunk_size]

# @timing
def insert_update(table_name:str, data, chunk_size=100_000):
    """insert, or update if meet UniqueViolation

    Example
    -------
    >>> self.insert_update('main.ohlc', {"ticker":"AAA", "date":'2021-07-25',
            "open":1.2 , "high":2.5, "low":1, "close":2, "volume":1000})
    """

    conn = psycopg2.connect(
            host     = config.DB_HOST,
            port     = config.DB_PORT,
            database = config.DB_NAME,
            user     = config.DB_USER,
            password = config.DB_PASSWORD,
        )
    cursor = conn.cursor()


    chunks = _generate_data(data, chunk_size)

    for chunk in tqdm(chunks,
                      total=np.ceil(len(data)/chunk_size)):
        if not isinstance(chunk, list):
            if isinstance(chunk, pd.DataFrame):
                chunk = chunk.replace({np.nan: None})
                chunk = chunk.to_dict('records')
            else:
                chunk = [chunk]

        cols = chunk[0].keys()
        # generate multiple rows values update
        temp_rows = []
        for row_data in chunk:
            values_1_row = \
                SQL('(') + \
                SQL(', ').join(map(Literal, row_data.values())) +\
                SQL(')')
            temp_rows.append(values_1_row)
        values = SQL(', ').join(temp_rows)
        # print(values.as_string(self.conn))

        primary_key_constraint_name = 'PK_' + table_name.split('.')[-1] 

        template = """INSERT INTO {table_name} ({columns}) VALUES {values}
            ON CONFLICT ON CONSTRAINT {pk_constr} DO UPDATE SET {update_exp}"""

        temp_cols = []
        for col in cols:
            temp_cols.append(SQL(f'{col}=EXCLUDED.{col}'))
        update_exp = SQL(', ').join(temp_cols)

        script = SQL(template).format(
            table_name = SQL(table_name),
            columns    = SQL(', ').join(map(Identifier, cols)),
            values     = values,
            pk_constr  = SQL(primary_key_constraint_name),
            update_exp = update_exp,
            ).as_string(conn)

        cursor.execute(script)
        conn.commit()
    conn.close()

#note template
#groupby_object = df.groupby(by=['customer_phone'], as_index=True, sort=False)

# def get_th_max(x, nth=1):
#     return x.sort_values(ascending=False).iloc[nth+1]

# groupby_object.sum() # 1
# groupby_object.agg('sum') # 2
# groupby_object.agg(['sum','mean']) # 3
# groupby_object.apply(pd.DataFrame.nunique) # 4

# groupby_object.agg({'col_1': ['sum','mean'], 'col_2': 'mean', 'col_3': get_th_max()}) # 5
# groupby_object.agg({'col_1': lambda x: get_th_max(x, nth=2)}) # 6
# groupby_object.agg({'col_1': ['sum','mean'], 'col_2': 'mean',}) # 7

# groupby_object.agg(col_1_sum=('col_1',sum)) # 8 
# groupby_object.agg(min_col_1=("col_1", "min")) # 9
# groupby_object.agg(min_col_1=pd.NamedAgg(column="col_1", aggfunc="min")) # 10

# groupby_object['col_1'].mean() # 11
# groupby_object['col_1'].agg('mean') # 12
# groupby_object['col_1'].agg(['mean']) # 13
# groupby_object['col_1'].agg(min_col_1="min", max_col_1="max") # 14